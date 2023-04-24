'use strict';

const AWS = require('aws-sdk');
const { BINDING_TYPE, COMMON_ERROR_MESSAGE, unixTimestamp, SUCCESS, telegramTable, ERROR } = require('./common');

const region = "us-east-1";
const telegramTableName = "Community-telegram";
const dynamo = new AWS.DynamoDB.DocumentClient({ region: region });


module.exports.bind = async (event, context) => {

    let body = JSON.parse(event.body);
    let { address, code, content_id } = body;

    const result = await getBindingByCode(code);

    if (result.status === SUCCESS && result.item) {

        const binding = result.item;

        if (binding.content_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "This code already used" })
            }
        }

        binding.address = address;
        binding.content_id = content_id;
        binding.updated_at = unixTimestamp();

        const saved = await saveBinding(binding);
        
        if (saved.status === SUCCESS) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Successfuly binded" })
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

const saveBinding = async(binding) => {
    
    const params = {
        TableName: telegramTable,
        Item: binding
    }
    
    try {
        await dynamo.put(params).promise();
        return {
            status: SUCCESS
        }
    } catch (error) {
        console.log(`Error when save binding with params: ${params}`, error);
        return {
            status: ERROR
        }
    }
}