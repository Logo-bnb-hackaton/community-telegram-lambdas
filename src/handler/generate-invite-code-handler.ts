import {errorResponse, toResponse, unknownErrorResponse} from "../aws/lambda";
import {APIGatewayProxyResult, Handler} from "aws-lambda";
import {GetInviteLinkStatusType} from "./get-invite-link-status-handler";
import {TelegramCode, TelegramCodeType, telegramCodeRepository} from "../repository/telegram-code-repository";
import {generateCode, unixTimestamp} from "../aws/common";

interface GenerateInviteCodeRequest {
    address: string,
    subscription_id: string
}

interface GenerateInviteCodeResponse {
    status: GetInviteLinkStatusType,
    code: string
}

export const generateInviteCodeHandler: Handler = async (request: GenerateInviteCodeRequest): Promise<APIGatewayProxyResult> => {
    try {

        const {address, subscription_id} = request;

        const bindedCode = await telegramCodeRepository.findBindingBySubscriptionId(subscription_id);

        if (!bindedCode) {
            console.log(`Cant find binded code for subscription with id ${subscription_id}`);
            return errorResponse(400, 'bad_request', 'Can\'t find subscription');
        }

        const newInviteCode: TelegramCode = {
            code_type: TelegramCodeType.INVITE,
            code: `inv${generateCode()}`,
            address: address,
            subscription_id: subscription_id,
            chat_id: bindedCode.chat_id,
            created_at: unixTimestamp()
        };

        await telegramCodeRepository.save(newInviteCode);
        console.log(`New code generated ${newInviteCode}`);

        const response: GenerateInviteCodeResponse = {
            status: GetInviteLinkStatusType.CODE_GENERATED,
            code: newInviteCode.code
        };

        return toResponse(200, response);

    } catch (err) {
        console.error(err);
        return unknownErrorResponse;
    }
}