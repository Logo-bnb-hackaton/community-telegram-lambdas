import { APIGatewayProxyResult, Handler } from "aws-lambda";
import { telegramCodeRepository } from "../repository/telegram-code-repository";
import { toResponse } from "../aws/lambda";

export interface GetChatBindingStatusRequest {
    subscription_id: string
}

export interface GetChatBindingStatusResponse {
    status: ChatBindingStatus,
    link?: string
}

export enum ChatBindingStatus {
    BINDED,
    NOT_BINDED
}

export const getChatBindingStatusHandler: Handler = async (request: GetChatBindingStatusRequest): Promise<APIGatewayProxyResult> => {
    try {

        const telegramCode = await telegramCodeRepository.findBindingBySubscriptionId(request.subscription_id);
        if (!telegramCode) {
            console.log(`The subscription ${request.subscription_id} doesn't have binding with telegram chat`);
            const response: GetChatBindingStatusResponse = {
                status: ChatBindingStatus.NOT_BINDED
            }
            return toResponse(200, response);
        }  

        const response: GetChatBindingStatusResponse = {
            status: ChatBindingStatus.BINDED,
            link: 'some-link' // Add link here
        }

        return toResponse(400, response);
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


