"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmpty = exports.trimExtension = exports.zip = exports.humanSize = exports.findProjectRoot = exports.findUp = exports.spawnProcess = exports.SpawnError = void 0;
const bestzip_1 = require("bestzip");
const archiver_1 = __importDefault(require("archiver"));
const execa_1 = __importDefault(require("execa"));
const function_1 = require("fp-ts/lib/function");
const IO = __importStar(require("fp-ts/lib/IO"));
const IOO = __importStar(require("fp-ts/lib/IOOption"));
const TE = __importStar(require("fp-ts/lib/TaskEither"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fp_fs_1 = require("./utils/fp-fs");
class SpawnError extends Error {
    constructor(message, stdout, stderr) {
        super(message);
        this.stdout = stdout;
        this.stderr = stderr;
    }
    toString() {
        return `${this.message}\n${this.stderr}`;
    }
}
exports.SpawnError = SpawnError;
/**
 * Executes a child process without limitations on stdout and stderr.
 * On error (exit code is not 0), it rejects with a SpawnProcessError that contains the stdout and stderr streams,
 * on success it returns the streams in an object.
 * @param {string} command - Command
 * @param {string[]} [args] - Arguments
 * @param {Object} [options] - Options for child_process.spawn
 */
function spawnProcess(command, args, options) {
    return (0, execa_1.default)(command, args, options);
}
exports.spawnProcess = spawnProcess;
const rootOf = (p) => path_1.default.parse(path_1.default.resolve(p)).root;
const isPathRoot = (p) => rootOf(p) === path_1.default.resolve(p);
const findUpIO = (name, directory = process.cwd()) => (0, function_1.pipe)(path_1.default.resolve(directory), (dir) => (0, function_1.pipe)((0, fp_fs_1.safeFileExistsIO)(path_1.default.join(dir, name)), IO.chain((exists) => {
    if (exists)
        return IOO.some(dir);
    if (isPathRoot(dir))
        return IOO.none;
    return findUpIO(name, path_1.default.dirname(dir));
})));
/**
 * Find a file by walking up parent directories
 */
const findUp = (name) => (0, function_1.pipe)(findUpIO(name), IOO.toUndefined)();
exports.findUp = findUp;
/**
 * Forwards `rootDir` or finds project root folder.
 */
const findProjectRoot = (rootDir) => (0, function_1.pipe)(IOO.fromNullable(rootDir), IOO.fold(() => findUpIO('yarn.lock'), IOO.of), IOO.fold(() => findUpIO('pnpm-lock.yaml'), IOO.of), IOO.fold(() => findUpIO('package-lock.json'), IOO.of), IOO.toUndefined)();
exports.findProjectRoot = findProjectRoot;
const humanSize = (size) => {
    const exponent = Math.floor(Math.log(size) / Math.log(1024));
    const sanitized = (size / 1024 ** exponent).toFixed(2);
    return `${sanitized} ${['B', 'KB', 'MB', 'GB', 'TB'][exponent]}`;
};
exports.humanSize = humanSize;
const zip = async (zipPath, filesPathList, useNativeZip = false) => {
    // create a temporary directory to hold the final zip structure
    const tempDirName = `${path_1.default.basename(zipPath).slice(0, -4)}-${Date.now().toString()}`;
    const tempDirPath = path_1.default.join(os_1.default.tmpdir(), tempDirName);
    const copyFileTask = (file) => (0, fp_fs_1.copyTask)(file.rootPath, path_1.default.join(tempDirPath, file.localPath));
    const copyFilesTask = TE.traverseArray(copyFileTask);
    const bestZipTask = (0, fp_fs_1.taskFromPromise)(() => (0, bestzip_1.bestzip)({ source: '*', destination: zipPath, cwd: tempDirPath }));
    const nodeZipTask = (0, fp_fs_1.taskFromPromise)(() => nodeZip(zipPath, filesPathList));
    await (0, function_1.pipe)(
    // create the random temporary folder
    (0, fp_fs_1.mkdirpTask)(tempDirPath), 
    // copy all required files from origin path to (sometimes modified) target path
    TE.chain(() => copyFilesTask(filesPathList)), 
    // prepare zip folder
    TE.chain(() => (0, fp_fs_1.mkdirpTask)(path_1.default.dirname(zipPath))), 
    // zip the temporary directory
    TE.chain(() => (useNativeZip ? bestZipTask : nodeZipTask)), 
    // delete the temporary folder
    TE.chain(() => (0, fp_fs_1.removeTask)(tempDirPath)), fp_fs_1.taskEitherToPromise);
};
exports.zip = zip;
function nodeZip(zipPath, filesPathList) {
    const zipArchive = archiver_1.default.create('zip');
    const output = fs_extra_1.default.createWriteStream(zipPath);
    // write zip
    output.on('open', () => {
        zipArchive.pipe(output);
        filesPathList.forEach((file) => {
            const stats = fs_extra_1.default.statSync(file.rootPath);
            if (stats.isDirectory())
                return;
            zipArchive.append(fs_extra_1.default.readFileSync(file.rootPath), {
                name: file.localPath,
                mode: stats.mode,
                date: new Date(0), // necessary to get the same hash when zipping the same content
            });
        });
        zipArchive.finalize();
    });
    return new Promise((resolve, reject) => {
        output.on('close', resolve);
        zipArchive.on('error', (err) => reject(err));
    });
}
function trimExtension(entry) {
    return entry.slice(0, -path_1.default.extname(entry).length);
}
exports.trimExtension = trimExtension;
const isEmpty = (obj) => {
    // eslint-disable-next-line no-unreachable-loop
    for (const _i in obj)
        return false;
    return true;
};
exports.isEmpty = isEmpty;
//# sourceMappingURL=utils.js.map