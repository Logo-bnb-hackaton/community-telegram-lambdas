import {APIGatewayProxyResult, Handler} from "aws-lambda";
import {telegramCodeRepository} from "../repository/telegram-code-repository";
import {errorResponse, toResponse} from "../aws/lambda";
import {bot} from "./telegram-webhook-handler";

export interface GetChatBindingStatusRequest {
    subscription_id: string
    address: string
}

export interface GetChatBindingStatusResponse {
    status: ChatBindingStatus,
    chat: {
        title: string | undefined,
        link: string | undefined,
    } | undefined
}

export enum ChatBindingStatus {
    BINDED,
    NOT_BINDED
}

export const getChatBindingStatusHandler: Handler = async (request: GetChatBindingStatusRequest): Promise<APIGatewayProxyResult> => {
    try {

        const telegramCode = await telegramCodeRepository.findBindingBySubscriptionIdWithScan(request.subscription_id);
        if (!telegramCode) {
            console.log(`The subscription ${request.subscription_id} doesn't have binding with telegram chat`);
            const response: GetChatBindingStatusResponse = {
                status: ChatBindingStatus.NOT_BINDED,
                chat: undefined
            }
            return toResponse(200, response);
        }

        if (telegramCode.address !== request.address) {
            console.log(`You are not permitted to use this method.`);
            return errorResponse(403, "no_permitted", "You are not permitted to use this method.");
        }

        console.log(`Loading chat info by id: ${telegramCode.chat_id}`);
        const chat = await bot.getChat(telegramCode.chat_id);
        console.log(chat);

        const response: GetChatBindingStatusResponse = {
            status: ChatBindingStatus.BINDED,
            chat: {
                title: chat.title,
                link: chat.invite_link
            }
        }

        return toResponse(200, response);
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


