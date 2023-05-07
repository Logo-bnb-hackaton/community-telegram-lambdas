import { GetItemCommand, GetItemCommandInput, PutItemCommand, PutItemCommandInput } from "@aws-sdk/client-dynamodb"
import { documentClient } from "../aws/dynamo"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"

export interface PrivatChatMapping {
    user_id: string,
    chat_id: string,
}

export interface TelegramPrivateChatMappingRepository {

    save(mapping: PrivatChatMapping): Promise<void>

    getByUserId(userId: number): Promise<PrivatChatMapping>
    
}

export class TelegramPrivateChatMappingRepositoryImpl implements TelegramPrivateChatMappingRepository {

    private table: string = "telegram-private-chat-mapping"

    async save(mapping: PrivatChatMapping): Promise<void> {

        console.log(`Try to save new mapping ${mapping}`);

        const input: PutItemCommandInput = {
            TableName: this.table,
            Item: marshall(mapping)
        }

        const command: PutItemCommand = new PutItemCommand(input);

        await documentClient.send(command);

        console.log(`New mapping saved ${mapping}`);
    }

    async getByUserId(userId: number): Promise<PrivatChatMapping> {
        
        const input: GetItemCommandInput = {
            TableName: this.table,
            Key: marshall({
                user_id: userId
            })
        }

        const command: GetItemCommand = new GetItemCommand(input);

        const { Item } = await documentClient.send(command);

        return unmarshall(Item) as PrivatChatMapping
    }
}


const telegramPrivateChatMappingRepository: TelegramPrivateChatMappingRepository = new TelegramPrivateChatMappingRepositoryImpl()
export { telegramPrivateChatMappingRepository }