'use strict';

const AWS = require('aws-sdk');
const { BINDING_TYPE, COMMON_ERROR_MESSAGE, unixTimestamp } = require('./common');

const region = "us-east-1";
const telegramTableName = "Community-telegram";
const dynamo = new AWS.DynamoDB.DocumentClient({ region: region });


module.exports.bind = async (event, context) => {
    
    let body = JSON.parse(event.body);
    let { address, code, content_id } = body;

    const binding = await getBindingByCode(code);

    binding.address = address;
    binding.content_id = content_id;
    binding.updated_at = unixTimestamp();


}

const getBindingByCode = async (code) => {

    const params = {
        TableName: telegramTableName,
        Key: {
            "type": BINDING_TYPE,
            "code": code,
        },
    };

    try {
        const resutl = await dynamo.get(params).promise();
        return {
            status: "success",
            item: resutl.Item
        }
    } catch (error) {
        console.error(`Error when get invite info from table for params: ${params}`, error);
        return {
            status: "error",
            message: COMMON_ERROR_MESSAGE,
        }
    }
}