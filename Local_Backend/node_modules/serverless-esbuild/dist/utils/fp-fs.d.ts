/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import type { Lazy } from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import * as IO from 'fp-ts/lib/IO';
import * as IOE from 'fp-ts/lib/IOEither';
import * as TE from 'fp-ts/lib/TaskEither';
import fs from 'fs-extra';
export declare const ioFromSync: <A>(f: Lazy<A>) => IOE.IOEither<Error, A>;
export declare const taskFromPromise: <A>(f: Lazy<Promise<A>>) => TE.TaskEither<Error, A>;
export declare const eitherToPromise: <E, A>(e: E.Either<E, A>) => Promise<A>;
export declare const taskEitherToPromise: <E, A>(te: TE.TaskEither<E, A>) => Promise<A>;
export declare const fileExistsIO: (path: fs.PathLike) => IOE.IOEither<Error, boolean>;
export declare const safeFileExistsIO: (path: fs.PathLike) => IO.IO<boolean>;
export declare const mkdirpIO: (dir: string) => IOE.IOEither<Error, void>;
export declare const mkdirpTask: (dir: string) => TE.TaskEither<Error, void>;
export declare const readFileIO: (file: fs.PathOrFileDescriptor) => IOE.IOEither<Error, Buffer>;
export declare const readFileTask: (file: number | fs.PathLike) => TE.TaskEither<NodeJS.ErrnoException, Buffer>;
export declare const copyIO: (src: string, dest: string, options?: fs.CopyOptionsSync) => IOE.IOEither<Error, void>;
export declare const copyTask: (src: string, dest: string, options?: fs.CopyOptions) => TE.TaskEither<Error, void>;
export declare const removeIO: (dir: string) => IOE.IOEither<Error, void>;
export declare const removeTask: (dir: string) => TE.TaskEither<Error, void>;
export declare const statIO: (path: fs.PathLike) => IOE.IOEither<Error, fs.Stats>;
export declare const statTask: (path: fs.PathLike) => TE.TaskEither<NodeJS.ErrnoException, fs.Stats>;
//# sourceMappingURL=fp-fs.d.ts.map