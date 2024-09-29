"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dynamodb_1 = require("../../dynamodb");
const handleResponse_1 = require("../handleResponse");
const USERS_TABLE = "usersTable";
const handler = async (event) => {
    console.log(event.pathParameters);
    console.log(typeof event.pathParameters);
    const userId = event.pathParameters.id;
    if (!userId || userId.trim() === '') {
        return (0, handleResponse_1.notFoundResponse)();
    }
    const result = await (0, dynamodb_1.getItem)(USERS_TABLE, userId);
    if (!result.success) {
        return (0, handleResponse_1.internalServerErrorResponse)();
    }
    if (!result.body.pk) {
        return (0, handleResponse_1.notFoundResponse)();
    }
    return (0, handleResponse_1.successResponse)(JSON.stringify(result.body));
};
exports.handler = handler;
