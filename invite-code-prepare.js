'use strict';

import { telegramTable, unixTimestamp, BINDING_TYPE, INVITE_TYPE, COMMON_ERROR_MESSAGE, SUCCESS, ERROR, generateRandomCode } from './common';

const AWS = require('aws-sdk');

const region = "us-east-1";
const telegramTableName = "Community-telegram";
const dynamo = new AWS.DynamoDB.DocumentClient({ region: region });


module.exports.prepareInvite = async (event, context) => {

    let body = JSON.parse(event.body);
    let { address, content_id } = body;

    let result = await getTelegramChatByContentId(content_id);

    if (result.status === SUCCESS && result.item) {

        let preparedInvite = {
            type: INVITE_TYPE,
            code: `inv${generateRandomCode()}`,
            address: address,
            content_id: content_id,
            chat_id: chat.chat_id,
            created_at: unixTimestamp()
        };


        let saved = await savePreparedInvite(preparedInvite);

        if (saved.status === SUCCESS) {
            return {
                statusCode: 200,
                body: JSON.stringify({ code: preparedInvite.code })
            }
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: COMMON_ERROR_MESSAGE })
            }
        }
    }

    if (result.status === SUCCESS) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: "Not found" })
        }
    }

    return {
        statusCode: 500,
        body: JSON.stringify({ message: COMMON_ERROR_MESSAGE })
    }
}

const getTelegramChatByContentId = async (contentId) => {

    const params = {
        TableName: telegramTable,
        Key: {
            "type": BINDING_TYPE,
            "content_id": contentId,
        }
    };

    try {
        const result = await dynamo.get(params).promise();
        return {
            status: "success",
            item: result.Item
        }
    } catch (error) {
        console.error(`Error when get chat by content id with params: ${params}`, error);
        return {
            status: "error",
            message: COMMON_ERROR_MESSAGE,
        }
    }
}


const savePreparedInvite = async (preparedInvite) => {

    const params = {
        TableName: telegramTable,
        Item: preparedInvite,
    };

    try {
        await dynamo.put(params).promise()
        return {
            status: SUCCESS
        }
    } catch (error) {
        console.error(`Error when save prepared invite to db with params: ${preparedInvite}`, error);
        return {
            status: ERROR,
            message: COMMON_ERROR_MESSAGE,
        }
    }

}