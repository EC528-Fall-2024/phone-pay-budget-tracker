import { APIGatewayProxyResult } from 'aws-lambda';

export const successResponse = (body: string): APIGatewayProxyResult => {
  return generateResponse(200, body)
}

export const createdResponse = (body: string): APIGatewayProxyResult => {
  return generateResponse(201, body)
}

export const notFoundResponse = (): APIGatewayProxyResult => {
  return generateResponse(404, '')
}

export const unprocessableContentResponse = (body: string): APIGatewayProxyResult => {
  return generateResponse(422, body)
}

export const internalServerErrorResponse = (): APIGatewayProxyResult => {
  return generateResponse(500, '')
}

const generateResponse = (statusCode: number, body: string): APIGatewayProxyResult => {
  return {
    statusCode: statusCode,
    headers: {
        'content-type': 'application/json; charset=UTF-8',
    },
    body,
  };
}