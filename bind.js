'use strict';

const AWS = require('aws-sdk');

const region = "us-east-1";
const telegramTableName = "Community-telegram";
const dynamo = new AWS.DynamoDB.DocumentClient({ region: region });


module.exports.bind = (event, context) => {
    let body = JSON.parse(event.body);
    let { address, code, content_id } = body;

    dynamo.getItem({
        TableName: telegramTableName,
        Key: {
            "type": "binding",
            "code": code
        }
    })
}