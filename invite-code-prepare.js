'use strict';

const { unixTimestamp, INVITE_TYPE, COMMON_ERROR_MESSAGE, SUCCESS, generateRandomCode } = require('./common');
const { getTelegramChatByContentId, savePreparedInvite } = require('./repository');

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