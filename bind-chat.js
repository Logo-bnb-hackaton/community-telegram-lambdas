'use strict';

const { COMMON_ERROR_MESSAGE, unixTimestamp, SUCCESS } = require('./common');
const { getBindingByCode, saveBinding } = require('./repository');

module.exports.bindChat = async (event, context) => {

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