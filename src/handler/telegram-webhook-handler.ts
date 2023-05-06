import { SOMETHING_WRONG_MESSAGE, generateCode, unixTimestamp } from "../aws/common";
import { okResponse } from "../aws/lambda";
import { TelegramCode, TelegramCodeType, telegramCodeRepository } from "../repository/telegram-code-repository";
import { PrivatChatMapping, telegramPrivateChatMappingRepository } from "../repository/telegram-private-chat-mapping-repository";
import { APIGatewayEvent, APIGatewayProxyResult, Handler } from "aws-lambda";
import TelegramBot from "node-telegram-bot-api";
import { Update } from "node-telegram-bot-api";

const token = process.env.TOKEN;
const username = process.env.USERNAME;
const bot = new TelegramBot(token, { polling: false });

export const telegramWebhookHandler: Handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {

    try {
        
        const update = JSON.parse(event.body) as Update;
        const message = (update.message || update.edited_message)!;
        const chat = message.chat;
        const chatType = chat.type;

        switch (chatType) {
            case 'group':
                handleGroupMessage(message);
                break;
            case 'private':
                handlePrivateMessage(message);
                break;
            default:
                break;
        }

    } catch (err) {
        console.error(err);
    }

    return okResponse
}

const handleGroupMessage = async (message: TelegramBot.Message): Promise<void> => {
    const text = message.text;
    if (`@${username} bind` === text) {
        await handleBindCommand(message);
    }
}

const handleBindCommand = async (message: TelegramBot.Message): Promise<void> => {
    const chatId = message.chat.id;
    const userId = message.from.id;
    const admins = await bot.getChatAdministrators(chatId);
    const isAdmin = admins.some((admin) => admin.user.id === userId);

    if (isAdmin) {

        try {

            const privateChatInfo = await telegramPrivateChatMappingRepository.getByUserId(userId);
            if (!privateChatInfo) {
                await bot.sendMessage(chatId, "Can't create binding code because you didn't start a conversation with nodde bot in direct messages.");
                return;
            }

            const newBinding: TelegramCode = {
                type: TelegramCodeType.BINDING,
                code: `bind${generateCode()}`,
                chat_id: String(chatId),
                user_private_chat_id: privateChatInfo.chat_id,
                user_id: String(userId),
                created_at: unixTimestamp()
            }

            console.log(`Try to save new binding ${newBinding}`);

            await telegramCodeRepository.save(newBinding);

            console.log(`Binding code successfully created for chat ${newBinding.chat_id}. The code will be send in direct messages chat ${newBinding.user_private_chat_id} to user ${userId}`);
            await bot.sendMessage(newBinding.user_private_chat_id, `Your binding code is ${newBinding.code}. Do not share this with anyone. Use it to bind your Telegram group to your Nodde session. Enjoy!`);

        } catch (err) {
            await bot.sendMessage(chatId, SOMETHING_WRONG_MESSAGE);
            return;
        }

    } else {
        console.log(`Bind command invoked by member witout admin permissions, chatId: ${chatId}, userId: ${userId}`);
    }
}


const handlePrivateMessage = async (message: TelegramBot.Message): Promise<void> => {
    const text = message.text;
    if ('/start' === text) {
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

const handleStartCommand = async (message: TelegramBot.Message): Promise<void> => {

    const chatId = message.chat.id;
    const userId = message.from.id;
    console.log(`\\start command was invoked by user ${userId} in chat ${chatId}`);

    const privateChatInfo: PrivatChatMapping = {
        chat_id: String(chatId),
        user_id: String(userId)
    };

    try {

        await telegramPrivateChatMappingRepository.save(privateChatInfo);
        console.log(`New relation saved successfully, user ${userId} in chat ${chatId}. Send greeting to user`);
        await bot.sendMessage(chatId, "Hello! If you have binding or invintation code, please send it in the next message.");

    } catch (err) {
        console.log(err);
        await bot.sendMessage(chatId, SOMETHING_WRONG_MESSAGE)
    }
}

const handleInviteCode = async (message: TelegramBot.Message): Promise<void> => {

    const text = message.text;
    const code = text; // TODO get subsctring and validate;
    const privateChatId = String(message.chat.id);
    const userId = String(message.from.id);

    try {

        const telegramCode: TelegramCode = await telegramCodeRepository.getByCode(code);

        if (!telegramCode) {
            console.log(`Code ${code} not found`);
            bot.sendMessage(privateChatId, 'Can\'t find such invite code');
        }

        const inviteLink = telegramCode.invite_link;

        if (inviteLink) {
            await bot.sendMessage(privateChatId, "This invite code already used.");
            return;
        }

        const groupChatId = telegramCode.chat_id;

        const newInviteLink = await bot.createChatInviteLink(
            groupChatId,
            undefined,
            undefined,
            1,
            true
        );

        telegramCode.invite_link = newInviteLink.invite_link;
        telegramCode.updated_at = unixTimestamp();
        telegramCode.user_id = String(userId);
        telegramCode.invite_link_refresh_count = 0;
        telegramCode.user_private_chat_id = String(privateChatId);

        await telegramCodeRepository.save(telegramCode);

        console.log(`Invite link successfully generated for user ${userId} in chat ${privateChatId}`);
        await bot.sendMessage(privateChatId, `Your invite link here ${newInviteLink}. Don't share it with anyone`);

    } catch (err) {
        console.log(`Error when save infite link for user ${userId} in chat ${privateChatId}`);
        await bot.sendMessage(privateChatId, SOMETHING_WRONG_MESSAGE);
    }
}