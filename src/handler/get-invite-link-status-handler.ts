import { toResponse, unknownErrorResponse } from "../aws/lambda";
import { telegramCodeRepository } from "../repository/telegram-code-repository";
import { APIGatewayProxyResult, Handler } from "aws-lambda";

interface GetInviteLinkStatusRequest {
    address: string,
    subscription_id: string
}

interface GetInviteLinkStatusResponse {
    status: GetInviteLinkStatusType,
    code?: string
}

export enum GetInviteLinkStatusType {
    NOT_GENERATED,
    CODE_GENERATED,
    CODE_USED
}

export const getInviteLinkStatusHandler: Handler = async (request: GetInviteLinkStatusRequest): Promise<APIGatewayProxyResult> => {
    
    try {

        const code = await telegramCodeRepository.getByAddressAndSubscriptionId(request.address, request.subscription_id);
        
        if (!code) {
            console.log('Telegram code not found');

            const response: GetInviteLinkStatusResponse = {
                status: GetInviteLinkStatusType.NOT_GENERATED
            };

            return toResponse(200, response);
        } 

        if(!code.invite_link) {
            const response: GetInviteLinkStatusResponse = {
                status: GetInviteLinkStatusType.CODE_GENERATED,
                code: code.code
            };

            return toResponse(200, response);
        }

        const response: GetInviteLinkStatusResponse = {
            status: GetInviteLinkStatusType.CODE_USED
        };

        return toResponse(200, response);

    } catch (err) {
        console.error(err);
        return unknownErrorResponse
    }
}