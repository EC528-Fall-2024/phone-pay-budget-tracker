"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalServerErrorResponse = exports.unprocessableContentResponse = exports.notFoundResponse = exports.createdResponse = exports.successResponse = void 0;
const successResponse = (body) => {
    return generateResponse(200, body);
};
exports.successResponse = successResponse;
const createdResponse = (body) => {
    return generateResponse(201, body);
};
exports.createdResponse = createdResponse;
const notFoundResponse = () => {
    return generateResponse(404, '');
};
exports.notFoundResponse = notFoundResponse;
const unprocessableContentResponse = (body) => {
    return generateResponse(422, body);
};
exports.unprocessableContentResponse = unprocessableContentResponse;
const internalServerErrorResponse = () => {
    return generateResponse(500, '');
};
exports.internalServerErrorResponse = internalServerErrorResponse;
const generateResponse = (statusCode, body) => {
    return {
        statusCode: statusCode,
        headers: {
            'content-type': 'application/json; charset=UTF-8',
        },
        body,
    };
};
