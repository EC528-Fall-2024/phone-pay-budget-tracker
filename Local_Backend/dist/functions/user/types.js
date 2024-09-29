"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRequestBody = exports.User = void 0;
const zod_1 = require("zod");
exports.User = zod_1.z.object({
    pk: zod_1.z.string(),
    salary: zod_1.z.string(),
    rent: zod_1.z.string(),
    debt: zod_1.z.string(),
    savings: zod_1.z.string()
});
exports.UserRequestBody = exports.User.omit({ pk: true });
