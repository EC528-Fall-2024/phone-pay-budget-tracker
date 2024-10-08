"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dynamodb_1 = require("../../dynamodb");
const types_1 = require("./types");
const handleResponse_1 = require("../handleResponse");
const USERS_TABLE = "transactionsTable";
function randomId() {
    const max = 1000;
    const min = 1;
    return Math.floor(Math.random() * (max - min + 1) + min);
}
const handler = async (event) => {
    const requestBody = JSON.parse(event.body);
    const validation = types_1.UserRequestBody.safeParse(requestBody);
    if (!validation.success) {
        return (0, handleResponse_1.unprocessableContentResponse)(JSON.stringify(validation.error.issues));
    }
    const userId = `${randomId()}`;
    const user = {
        ...validation.data,
        pk: userId
    };
    console.log(user);
    const result = await (0, dynamodb_1.putItem)(USERS_TABLE, user);
    return result.success ? (0, handleResponse_1.createdResponse)(JSON.stringify(user)) : (0, handleResponse_1.internalServerErrorResponse)();
};
exports.handler = handler;
