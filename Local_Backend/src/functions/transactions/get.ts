import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { getItem } from '../../dynamodb';
import { internalServerErrorResponse, notFoundResponse, successResponse } from '../handleResponse'

const USERS_TABLE= "transactionsTable";

export const handler = async ( event: APIGatewayProxyEvent,): Promise<APIGatewayProxyResult> => {

    console.log(event.pathParameters);
    console.log(typeof event.pathParameters)

    const userId = event.pathParameters!.id;
    if(!userId || userId.trim() === ''){
        return notFoundResponse();
    }

    const result = await getItem(USERS_TABLE, userId);
    if(!result.success){
        return internalServerErrorResponse();
    }

    if(!result.body.pk){
        return notFoundResponse();
    }

    return successResponse(JSON.stringify(result.body));
};

