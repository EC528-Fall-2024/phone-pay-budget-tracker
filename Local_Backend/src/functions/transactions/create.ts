import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { putItem } from '../../dynamodb';
import { UserRequestBody } from './types'
import { internalServerErrorResponse, createdResponse, unprocessableContentResponse } from '../handleResponse'


const USERS_TABLE= "transactionsTable";

function randomId() {
    const max = 1000;
    const min = 1;
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const requestBody = JSON.parse(event.body!);
    const validation = UserRequestBody.safeParse(requestBody);
    if(!validation.success){
        return unprocessableContentResponse(JSON.stringify(validation.error.issues));
    }

    const userId = `${randomId()}`;
    const user = {
        ...validation.data,
        pk: userId
    }

    console.log(user)

    const result = await putItem(USERS_TABLE, user);
   
    return result.success ? createdResponse(JSON.stringify(user)) : internalServerErrorResponse()
};



