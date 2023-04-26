'use strict';

const { crypto, randomBytes } = require("crypto");

// DynamoDB tables
module.exports.telegramTable = "Community-telegram";
module.exports.telegramPrivateChatsTable = "Community-telegram-private-chats";

module.exports.BINDING_TYPE = "binding";
module.exports.INVITE_TYPE = "invite";

module.exports.COMMON_ERROR_MESSAGE = "Something went wrong";

// Statuses
module.exports.SUCCESS = "success";
module.exports.ERROR = "error";

module.exports.unixTimestamp = (date = Date.now()) => {
    return Math.floor(date / 1000)
}

module.exports.generateRandomCode = () => {
    const buffer = randomBytes(32);
    const randomString = buffer.toString('hex');
    return randomString;
}