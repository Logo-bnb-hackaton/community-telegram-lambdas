'use strict';

import { unixTimestamp, generateRandomCode } from './common';

const AWS = require('aws-sdk')
const crypto = require('crypto'); 
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: false });

const region = "us-east-1";
const telegramTableName = "Community-telegram";
const telegramPrivateChatsTableName = "Community-private-chat-telegram";
const dynamo = new AWS.DynamoDB.DocumentClient({ region: region });

module.exports.bot = async (event, context) => {

  let body = JSON.parse(event.body);
  let message = body.message || body.edited_message;

  let chat = message.chat
  let chatType = chat.type

  if (chatType === 'group') {
    await handleGroupMessage(message);
  } else if (chatType === 'private') {
    await handlePrivateMessage(message);
  }

  return { statusCode: 200 };
};

async function handleGroupMessage(message) {
  const text = message.text;
  if ('@nodde bind' === text) {
    handleBindCommand(message);
  }
}

async function handleBindCommand(message) {
  let chatId = message.chat.id;
  let userId = message.from.id;
  let admins = await bot.getChatAdministrators(chatId);
  let isAdmin = admins.some((admin) => admin.user.id === userId);
  if (isAdmin) {

    let privateChatInfo = getPrivateChatInfoByUserId(userId);

    if (privateChatInfo == undefined || privateChatInfo == null ) {
      bot.sendMessage(chatId, "Can't create binding code because you didn't start a conversation with nodde bot in direct messages.");
      return;
    }

    let newBinding = {
      type: "binding",
      code: `bind${generateRandomCode()}`,
      chat_id: chatId,
      user_private_chat_id: privateChatInfo.chat_id,
      user_id: userId,
      created_at: unixTimestamp()
    }

    try {
      saveNewBindingCode(newBinding);
      bot.sendMessage(newBinding.user_private_chat_id, `Your binding code is ${newBinding.code}. Do not share this with anyone. Use it to bind your Telegram group to your Nodde session. Enjoy!`);
    } catch (e) {
      console.error(e);
      bot.sendMessage(chatId, "Something went wrong. We are already fixing this...");
    }
  } else {
    console.log(`Bind command invoked by member witout admin permissions, chatId: ${chatId}, userId: ${userId}`);
  }
}

async function handlePrivateMessage(message) {
  let text = message.text;
  if ("/start" === text) {
    handleStartCommand(message);
  } else if (text.startsWith("bind")) {
    handleBindigingCode(message);
  } else if (text.startsWith("inv")) {
    handleInviteCode(message);
  } else {
    let chatId = message.chat.id;
    let userId = message.from.id;
    console.log(`Unrecognized message ${text} from user ${userId} in chat ${chatId}`);
  }
}

async function handleStartCommand(message) {
  let chatId = message.chat.id;
  let userId = message.from.id;
  console.log(`\\start command was invoked by user ${userId} in chat ${chatId}`);
  
  let privateChatInfo = {
    chat_id: chatId,
    user_id: userId
  };

  try {
    console.log(`Try to save new (private chat_id) -> (user_id) relation, user ${userId} in chat ${chatId}`);
    await dynamo.put({
      TableName: telegramPrivateChatsTableName,
      Item: privateChatInfo
    })
    .promise()
    .catch(console.error);
  } catch (e) {
    console.error(e);
  }
  console.log(`New relation saved successfully, user ${userId} in chat ${chatId}. Send greeting to user`)
  

  bot.sendMessage(chatId, "Hello! If you have binding or invintation code, please send it in the next message.");
}

async function handleBindigingCode(message) {
  let text = message.text;
  let code = text.subsctring();
}

async function handleInviteCode(message) {
  let text = message.text;
  let code = text;

  dynamo.getItem(
    {
      TableName: telegramTableName,
      Key: {type: "invite", code: `inv${code}`}
    },
    function (err, data) {
      if (err) {
        console.error(err);
      } else {
        let invitation = data.Item;
        let inviteLink = invitation.inviteLink;
        if (invite_link) {

        } else {

        }
      }
    }
  )

  let respose = dynamo.get().promise().Item;
}



async function saveNewBindingCode(bindingCode) {
  dynamo.put({
    TableName: telegramTableName,
    Item: newBinding,
  })
    .promise()
    .catch(console.error);
}

async function getPrivateChatInfoByUserId(userId) {
  return dynamo.get({
    TableName: telegramPrivateChatsTableName,
    Key: {"user_id": userId}
  }).promise().Item;
}