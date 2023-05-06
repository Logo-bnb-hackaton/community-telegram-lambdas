import { APIGatewayEvent, APIGatewayProxyResult, Handler } from "aws-lambda";
import { telegramCodeRepository, TelegramCode } from "../repository/telegram-code-repository";
import { unixTimestamp } from "../aws/common";
import { okResponse, unknownErrorResponse } from "../aws/lambda";

interface BindChatRequest {
    address: string,
    code: string,
    subscription_id: string
}

export const bindChatHandler: Handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        
        const request = JSON.parse(event.body) as BindChatRequest;
        const telegramCode: TelegramCode = await telegramCodeRepository.getByCode(request.code);
        
        if (!telegramCode) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: {
                        code: 'not_found',
                        message: 'Code not found'
                    }
                })
            }
        }

        if (telegramCode.subscription_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: {
                        code: 'code_already_used',
                        message: 'This code already used'
                    }
                })
            }
        }

        const updatedTelegramCode: TelegramCode = {
            code: telegramCode.code,
            chat_id: telegramCode.chat_id,
            created_at: telegramCode.created_at,
            type: telegramCode.type,
            user_id: telegramCode.user_id,
            address: request.address,
            subscription_id: request.subscription_id,
            updated_at: unixTimestamp()
        }

        await telegramCodeRepository.update(updatedTelegramCode);

    } catch (err) {
        console.error(err);
        return unknownErrorResponse;
    }

    return okResponse
}