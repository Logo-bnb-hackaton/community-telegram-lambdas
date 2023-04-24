'use strict'

import { telegramTable, INVITE_TYPE, COMMON_ERROR_MESSAGE } from "./common";

const region = "us-east-1";
const dynamo = new AWS.DynamoDB.DocumentClient({ region: region });

/*
    Get invite code handler
*/
module.exports.getInviteCode = async (event, context) => {

    let body = JSON.parse(event.body);
    let { address, content_id } = body.address;

    let { status, item } = await getInviteInfoByContentIdAndAddress(content_id, address);

    if (status === "success") {
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

const getInviteInfoByContentIdAndAddress = async (contentId, address) => {
    
    const params = {
        TableName: telegramTable,
        Key: {
            "type": INVITE_TYPE,
            "content_id": contentId,
            "address": address
        },
    };

    try {
        const result = await dynamo.get(params).promise();
        return {
            status: "success",
            item: result.Item
        }
    } catch (error) {
        console.error(`Error when get invite info from table for params: ${params}`, error);
        return { status: "error", message: COMMON_ERROR_MESSAGE }
    }
}