import { DynamoDBClientConfig, DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import https from 'https';

export const getDBClient = (options: DynamoDBClientConfig = {}) => {
    const client = DynamoDBDocument.from(new DynamoDB(options), {
        marshallOptions: {
            removeUndefinedValues: true,
        },
    });

    return client;
};

export const getDBConnection = (): DynamoDBDocument => {
    console.log('DynamoDB creating connection');

    const config: DynamoDBClientConfig = {
        apiVersion: '2012-08-10',
        region: "us-east-2",
        endpoint: "http://localhost:8000",
        credentials: {
            accessKeyId: "AKIAXNGUVBJOF253QOJU",
            secretAccessKey: "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",
        },
        maxAttempts: 2,
        requestHandler: new NodeHttpHandler({
            socketTimeout: 1000,
            connectionTimeout: 1000,
        }),
    };

    // Endpoint is empty when running in AWS
    if (!config.endpoint) {
        return getDBClient({
            requestHandler: new NodeHttpHandler({
                httpsAgent: new https.Agent({
                    maxSockets: 30,
                    keepAlive: true,
                }),
            }),
        });
    }

    return getDBClient(config);
};

export const dbConnection = getDBConnection();

export async function getItem(
    table: string,
    pk: string
){
    console.log('Dynamodb Get command');

    try{
        const command = new GetCommand({
            TableName: table,
            Key: { 'pk': pk },
            ConsistentRead: true,
        });

        const result = await dbConnection.send(command);

        return {
            success: true,
            body: result.Item ?? {}
        }
    } catch(error) {
        return {
            success: false,
            body: error.name,
        };
    }
}

export async function putItem(table: string, item: object){
    console.log('Dynamodb put command');

    try {
        const command =  new PutCommand({
            TableName: table,
            Item: item,
            ConditionExpression: 'attribute_not_exists(pk)',
        });

        const result = await dbConnection.send(command);
        return {
            success: true,
            body: result
        }

    } catch (error) {
        return {
            success: false,
            body: error.name,
        };
    }
}
