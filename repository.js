'use strict'

import { ERROR, INVITE_TYPE, SUCCESS, telegramPrivateChatsTable, telegramTable } from './common';

const AWS = require('aws-sdk');

const region = "us-east-1";
const dynamo = new AWS.DynamoDB.DocumentClient({ region: region });

const get = async (params) => {
    try {
        const result = await dynamo.get(params).promise();
        return {
            status: SUCCESS,
            item: result.Item
        }
    } catch (error) {
        console.error(`Error when get params: ${params}`, error);
        return { status: ERROR, message: COMMON_ERROR_MESSAGE }
    }
}

const save = async (params) => {
    try {
        await dynamo.put(params).promise();
        return {
            status: SUCCESS
        }
    } catch (error) {
        console.error(`Error when save to db with params: ${params}`, error);
        return {
            status: ERROR,
            message: COMMON_ERROR_MESSAGE,
        }
    }
}


export const getInviteInfoByContentIdAndAddress = async (contentId, address) => {

    const params = {
        TableName: telegramTable,
        Key: {
            "type": INVITE_TYPE,
            "content_id": contentId,
            "address": address
        },
    };

    return await get(params);
}

export const getTelegramChatByContentId = async (contentId) => {

    const params = {
        TableName: telegramTable,
        Key: {
            "type": BINDING_TYPE,
            "content_id": contentId,
        }
    };

    return await get(params);
}

export const savePreparedInvite = async (preparedInvite) => {

    const params = {
        TableName: telegramTable,
        Item: preparedInvite,
    };

    return await save(params);
}

export async function getPrivateChatInfoByUserId(userId) {

    let params = {
        TableName: telegramPrivateChatsTable,
        Key: {
            "user_id": userId
        }
    }

    return await get(params);
}

export async function saveNewBindingCode(bindingCode) {

    let params = {
        TableName: telegramTable,
        Item: newBinding,
    };

    return await save(params);
}

export const getBindingByCode = async (code) => {

    const params = {
        TableName: telegramTable,
        Key: {
            "type": BINDING_TYPE,
            "code": code,
        },
    };

    return await get(params);
}

export const saveBinding = async(binding) => {
    
    const params = {
        TableName: telegramTable,
        Item: binding
    }

    return await save(binding);
}

export const getInviteByCode = async (code) => {
    
    let params = {
        TableName: telegramTable,
        Key: {
            "type": INVITE_TYPE,
            "code": code,
        }
    };

    return await get(params);
}

export const savePrivateChat = async (privateChat) => {

    let params = {
        TableName: telegramPrivateChatsTable,
        Item: privateChat,
    };

    return await save(params);
}

export const saveInvite = async (invite) => {

    let params = {
        TableName: telegramTable,
        Item: invite,
    };

    return await save(params);
}