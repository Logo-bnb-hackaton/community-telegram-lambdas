'use strict'

import { COMMON_ERROR_MESSAGE, SUCCESS } from "./common";
import { getInviteInfoByContentIdAndAddress } from "./repository";

/*
    Get invite code handler
*/
module.exports.getInviteCode = async (event, context) => {

    let body = JSON.parse(event.body);
    let { address, content_id } = body.address;

    let { status, item } = await getInviteInfoByContentIdAndAddress(content_id, address);

    if (status === SUCCESS) {
        if (item) {
            return {
                statusCode: 200,
                body: JSON.stringify({ code: data.code })
            }
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Invite code not found" })
            }
        }
    } else {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: COMMON_ERROR_MESSAGE })
        }
    }
}