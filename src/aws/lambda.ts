import {APIGatewayProxyResult} from "aws-lambda";

export const toResponse = (status: number, body: any): APIGatewayProxyResult => {
    return {
        statusCode: status,
        body: JSON.stringify(body)
    }
};

export const okResponse: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify({
        status: 'ok'
    })
};

export const errorResponse = (status:number, code: string, message: string): APIGatewayProxyResult => {
    return {
        statusCode: status,
        body: JSON.stringify({
            error: {
                code: code,
                message: message
            }
        })
    }
};

export const unknownErrorResponse: APIGatewayProxyResult = errorResponse(500, 'unknown_error', 'Somenthing went wrong');
