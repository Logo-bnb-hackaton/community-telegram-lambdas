'use strict';

// DynamoDB tables
export const telegramTable = "Community-telegram";
export const telegramPrivateChatsTable = "Community-telegram-private-chats";

export const BINDING_TYPE = "binding";
export const INVITE_TYPE = "invite";

export const COMMON_ERROR_MESSAGE = "Something went wrong";

// Statuses
export const SUCCESS = "success";
export const ERROR = "error";

export function unixTimestamp(date = Date.now()) {
    return Math.floor(date / 1000)
}

export function generateRandomCode() {
    const buffer = crypto.randomBytes(32);
    const randomString = buffer.toString('hex');
    return randomString;
}