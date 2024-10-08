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
exports.statTask = exports.statIO = exports.removeTask = exports.removeIO = exports.copyTask = exports.copyIO = exports.readFileTask = exports.readFileIO = exports.mkdirpTask = exports.mkdirpIO = exports.safeFileExistsIO = exports.fileExistsIO = exports.taskEitherToPromise = exports.eitherToPromise = exports.taskFromPromise = exports.ioFromSync = void 0;
const function_1 = require("fp-ts/lib/function");
const E = __importStar(require("fp-ts/lib/Either"));
const IO = __importStar(require("fp-ts/lib/IO"));
const IOE = __importStar(require("fp-ts/lib/IOEither"));
const TE = __importStar(require("fp-ts/lib/TaskEither"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const ioFromSync = (f) => IOE.tryCatch(f, E.toError);
exports.ioFromSync = ioFromSync;
const taskFromPromise = (f) => TE.tryCatch(f, E.toError);
exports.taskFromPromise = taskFromPromise;
const eitherToPromise = (e) => new Promise((resolve, reject) => {
    E.fold(reject, resolve)(e);
});
exports.eitherToPromise = eitherToPromise;
const taskEitherToPromise = (te) => te().then(exports.eitherToPromise);
exports.taskEitherToPromise = taskEitherToPromise;
const fileExistsIO = (path) => (0, exports.ioFromSync)(() => fs_extra_1.default.existsSync(path));
exports.fileExistsIO = fileExistsIO;
exports.safeFileExistsIO = (0, function_1.flow)(exports.fileExistsIO, IOE.fold(IO.of(function_1.constFalse), IO.of));
const mkdirpIO = (dir) => (0, exports.ioFromSync)(() => fs_extra_1.default.mkdirpSync(dir));
exports.mkdirpIO = mkdirpIO;
exports.mkdirpTask = TE.taskify(fs_extra_1.default.mkdirp);
const readFileIO = (file) => (0, exports.ioFromSync)(() => fs_extra_1.default.readFileSync(file));
exports.readFileIO = readFileIO;
exports.readFileTask = TE.taskify(fs_extra_1.default.readFile);
const copyIO = (src, dest, options) => (0, exports.ioFromSync)(() => fs_extra_1.default.copySync(src, dest, options));
exports.copyIO = copyIO;
exports.copyTask = TE.taskify(fs_extra_1.default.copy);
const removeIO = (dir) => (0, exports.ioFromSync)(() => fs_extra_1.default.removeSync(dir));
exports.removeIO = removeIO;
exports.removeTask = TE.taskify(fs_extra_1.default.remove);
const statIO = (path) => (0, exports.ioFromSync)(() => fs_extra_1.default.statSync(path));
exports.statIO = statIO;
exports.statTask = TE.taskify(fs_extra_1.default.stat);
//# sourceMappingURL=fp-fs.js.map