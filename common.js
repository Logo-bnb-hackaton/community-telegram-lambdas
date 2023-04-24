'use strict';

export const telegramTable = "Community-telegram";

export const BINDING_TYPE = "binding";
export const INVITE_TYPE = "invite";

export function unixTimestamp(date = Date.now()) {
    return Math.floor(date / 1000)
}

export function generateRandomCode() {
    const buffer = crypto.randomBytes(32);
    const randomString = buffer.toString('hex');
    return randomString;
}