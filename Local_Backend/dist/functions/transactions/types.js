"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRequestBody = exports.User = void 0;
const zod_1 = require("zod");
exports.User = zod_1.z.object({
    pk: zod_1.z.string(),
    userId: zod_1.z.string(),
    expense: zod_1.z.string(),
    amount: zod_1.z.string(),
});
exports.UserRequestBody = exports.User.omit({ pk: true });
