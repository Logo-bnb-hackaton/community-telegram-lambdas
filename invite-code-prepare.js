'use strict';

import { unixTimestamp } from './common';

const AWS = require('aws-sdk');

const region = "us-east-1";
const telegramTableName = "Community-telegram";
const dynamo = new AWS.DynamoDB.DocumentClient({ region: region });


module.exports.prepareInvite = (event, context) => {
    
    let body = JSON.parse(event.body);
    let { address, content_id } = body;

    let chat = getTelegramChatByContentId(content_id);

    let preparedInvite = {
        type: "invite",
        code: code,
        address: address,
        content_id: content_id,
        chat_id: chat.chat_id,
        created_at: unixTimestamp()
    }

    savePreparedInvite(preparedInvite);
}


async function getTelegramChatByContentId(contentId) {
    return dynamo.get({
        TableName: telegramTableName,
        Key: { "content_id": contentId }
    }).promise().Item;
}

async function savePreparedInvite(preparedInvite) {
    // TODO implement
}