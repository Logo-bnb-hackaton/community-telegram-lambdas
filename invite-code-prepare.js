'use strict';

import { telegramTable, unixTimestamp, BINDING_TYPE, INVITE_TYPE } from './common';

const AWS = require('aws-sdk');

const region = "us-east-1";
const telegramTableName = "Community-telegram";
const dynamo = new AWS.DynamoDB.DocumentClient({ region: region });


module.exports.prepareInvite = async (event, context) => {

    let body = JSON.parse(event.body);
    let { address, content_id } = body;

    try {

        let chat = await getTelegramChatByContentId(content_id);

        let preparedInvite = {
            type: INVITE_TYPE,
            code: code,
            address: address,
            content_id: content_id,
            chat_id: chat.chat_id,
            created_at: unixTimestamp()
        };


        await savePreparedInvite(preparedInvite);

    } catch (e) {
        console.error(e);
    }

}


async function getTelegramChatByContentId(contentId) {
    return await dynamo.get({
        TableName: telegramTableName,
        Key: { 
            "type": BINDING_TYPE,
            "content_id": contentId 
        }
    }).promise();
}

async function savePreparedInvite(preparedInvite) {
    return await dynamo.put({
        TableName: telegramTable,
        Item: preparedInvite
    }).promise()
}