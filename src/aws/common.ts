import {APIGatewayProxyResultV2} from "aws-lambda";
import {randomBytes} from "crypto";
import dotenv from 'dotenv';

dotenv.config();

export const AWS_REGION = 'us-east-1';
export const SOMETHING_WRONG_MESSAGE = 'Some';

export const unixTimestamp = (date: number = Date.now()): number => {
    return Math.floor(date / 1000)
}

export const generateCode = (): string => {
    const buffer = randomBytes(32);
    return buffer.toString('hex');
}

export const process = async (block: () => APIGatewayProxyResultV2): Promise<APIGatewayProxyResultV2> => {
    try {
        return await block();
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: {
                    code: 'unknown_error',
                    message: 'Something went wrong'
                }
            })
        }
    }
}