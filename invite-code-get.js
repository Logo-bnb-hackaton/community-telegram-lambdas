'use strict'

import { telegramTable } from "./common";

const region = "us-east-1";
const dynamo = new AWS.DynamoDB.DocumentClient({ region: region });

module.exports.getInviteCode = (event, context) => {
    let body = JSON.parse(event.body);
    let { address, content_id } = body.address;

    dynamo.get(
        {
            TableName: telegramTable,
            Key: {
                "type": "invite",
                "content_id": content_id,
                "address": address
            }
        }
    )

    // TODO add implementation
}

