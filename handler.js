'use strict';

const { unixTimestamp, generateRandomCode, SUCCESS, ERROR } = require('./common');
const { getInviteByCode, getPrivateChatInfoByUserId, saveInvite, saveNewBindingCode, savePrivateChat } = require('./repository');

const TelegramBot = require('node-telegram-bot-api');

const token = '5594626655:AAHPrN4jgWeLNuoGsHomF__ggck1kSc4lfU';
const bot = new TelegramBot(token, { polling: false });

const SOMETHING_WRONG_MESSAGE = "Hmm... Something went wrong. We are already fixing this."

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
    await handleBindCommand(message);
  }
}

async function handleBindCommand(message) {

  let chatId = message.chat.id;
  let userId = message.from.id;
  let admins = await bot.getChatAdministrators(chatId);
  let isAdmin = admins.some((admin) => admin.user.id === userId);

  if (isAdmin) {

    let privateChatInfo = await getPrivateChatInfoByUserId(userId);

    if (privateChatInfo.status === ERROR) {
      await bot.sendMessage(chatId, SOMETHING_WRONG_MESSAGE);
      return;
    }

    if (!privateChatInfo) {
      await bot.sendMessage(chatId, "Can't create binding code because you didn't start a conversation with nodde bot in direct messages.");
      return;
    }

    const newBinding = {
      type: "binding",
      code: `bind${generateRandomCode()}`,
      chat_id: chatId,
      user_private_chat_id: privateChatInfo.chat_id,
      user_id: userId,
      created_at: unixTimestamp()
    }

    console.log(`Try to save new binding ${newBinding}`);

    let { status } = await saveNewBindingCode(newBinding);

    if (status === SUCCESS) {
      await bot.sendMessage(newBinding.user_private_chat_id, `Your binding code is ${newBinding.code}. Do not share this with anyone. Use it to bind your Telegram group to your Nodde session. Enjoy!`);
    } else {
      await bot.sendMessage(chatId, SOMETHING_WRONG_MESSAGE);
    }

  } else {
    console.log(`Bind command invoked by member witout admin permissions, chatId: ${chatId}, userId: ${userId}`);
  }
}

async function handlePrivateMessage(message) {
  let text = message.text;
  if ("/start" === text) {
    await handleStartCommand(message);
  } else if (text.startsWith("bind")) {
    // Ignore the message if the user entered bind code
    console.log(`User ${message.from.id} in chat ${message.chat.id} entered some binding code, skip the message`);
  } else if (text.startsWith("inv")) {
    await handleInviteCode(message);
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

  let { status } = await savePrivateChat(privateChatInfo);

  if (status === SUCCESS) {
    console.log(`New relation saved successfully, user ${userId} in chat ${chatId}. Send greeting to user`);
    await bot.sendMessage(chatId, "Hello! If you have binding or invintation code, please send it in the next message.");
  } else {
    await bot.sendMessage(chatId, SOMETHING_WRONG_MESSAGE)
  }  
}

async function handleInviteCode(message) {
  
  let text = message.text;
  let code = text; // TODO get subsctring and validate;
  let privateChatId = message.chat.id;
  let userId = message.from.id;

  let { status, item } = await getInviteByCode(code);

  if (status === SUCCESS && item) {
    let invite = result.item;
    let inviteLink = invite.invite_link;
    if (inviteLink) {
      await bot.sendMessage(privateChatId, "This invite code already used.");
    } else {

      let groupChatId = item.chat_id;
      let newInviteLink = await bot.createChatInviteLink(groupChatId, { member_limit: 1, creates_join_request: true });
      
      invite.invite_link = newInviteLink;
      invite.updated_at = unixTimestamp();
      invite.user_id = userId;
      invite.invite_refresh_count = 0;
      invite.user_private_chat_id = privateChatId;

      let { status } = await saveInvite(invite);

      if (status === SUCCESS) {
        console.log(`Invite link successfully generated for user ${userId} in chat ${chatId}`);
        await bot.sendMessage(chatId, `Your invite link here ${newInviteLink}. Don't share it with anyone`);
      } else {
        console.log(`Error when save infite link for user ${userId} in chat ${chatId}`);
        await bot.sendMessage(chatId, SOMETHING_WRONG_MESSAGE);
      }
    }

    return;
  }

  // Query success, but no item found
  if (status === SUCCESS) {
    console.log(`User ${userId} in chat ${chatId} entered not existed code ${code}`);
    await bot.sendMessage(chatId, "Sorry, we can't find this code, please try again.");
  } else {
    console.error(`Error when handle invite code ${code} for user ${userId} in chat ${chatId}`);
    await bot.sendMessage(chatId, SOMETHING_WRONG_MESSAGE);
  }
}