"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.putItem = exports.getItem = exports.dbConnection = exports.getDBConnection = exports.getDBClient = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const node_http_handler_1 = require("@aws-sdk/node-http-handler");
const https_1 = __importDefault(require("https"));
const getDBClient = (options = {}) => {
    const client = lib_dynamodb_1.DynamoDBDocument.from(new client_dynamodb_1.DynamoDB(options), {
        marshallOptions: {
            removeUndefinedValues: true,
        },
    });
    return client;
};
exports.getDBClient = getDBClient;
const getDBConnection = () => {
    console.log('DynamoDB creating connection');
    const config = {
        apiVersion: '2012-08-10',
        region: "us-east-2",
        endpoint: "http://localhost:8000",
        credentials: {
            accessKeyId: "AKIAXNGUVBJOF253QOJU",
            secretAccessKey: "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",
        },
        maxAttempts: 2,
        requestHandler: new node_http_handler_1.NodeHttpHandler({
            socketTimeout: 1000,
            connectionTimeout: 1000,
        }),
    };
    if (!config.endpoint) {
        return (0, exports.getDBClient)({
            requestHandler: new node_http_handler_1.NodeHttpHandler({
                httpsAgent: new https_1.default.Agent({
                    maxSockets: 30,
                    keepAlive: true,
                }),
            }),
        });
    }
    return (0, exports.getDBClient)(config);
};
exports.getDBConnection = getDBConnection;
exports.dbConnection = (0, exports.getDBConnection)();
async function getItem(table, pk) {
    console.log('Dynamodb Get command');
    try {
        const command = new lib_dynamodb_1.GetCommand({
            TableName: table,
            Key: { 'pk': pk },
            ConsistentRead: true,
        });
        const result = await exports.dbConnection.send(command);
        return {
            success: true,
            body: result.Item ?? {}
        };
    }
    catch (error) {
        return {
            success: false,
            body: error.name,
        };
    }
}
exports.getItem = getItem;
async function putItem(table, item) {
    console.log('Dynamodb put command');
    try {
        const command = new lib_dynamodb_1.PutCommand({
            TableName: table,
            Item: item,
            ConditionExpression: 'attribute_not_exists(pk)',
        });
        const result = await exports.dbConnection.send(command);
        return {
            success: true,
            body: result
        };
    }
    catch (error) {
        return {
            success: false,
            body: error.name,
        };
    }
}
exports.putItem = putItem;
