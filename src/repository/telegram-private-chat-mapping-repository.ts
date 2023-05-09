import {GetItemCommand, GetItemCommandInput, PutItemCommand, PutItemCommandInput} from "@aws-sdk/client-dynamodb"
import {documentClient} from "../aws/dynamo"
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb"

export interface PrivateChatMapping {
    user_id: string,
    chat_id: string,
}

export interface TelegramPrivateChatMappingRepository {

    save(mapping: PrivateChatMapping): Promise<void>

    getByUserId(userId: number): Promise<PrivateChatMapping>

}

export class TelegramPrivateChatMappingRepositoryImpl implements TelegramPrivateChatMappingRepository {

        private table: string = "telegram-private-chats"

    async save(mapping: PrivateChatMapping): Promise<void> {

        console.log(`Try to save new mapping ${mapping}`);

        const input: PutItemCommandInput = {
            TableName: this.table,
            Item: marshall(mapping)
        }

        const command: PutItemCommand = new PutItemCommand(input);

        await documentClient.send(command);

        console.log(`New mapping saved ${mapping}`);
    }

    async getByUserId(userId: number): Promise<PrivateChatMapping> {
        console.log(`Loading user by id: ${userId}`);
        const input: GetItemCommandInput = {
            TableName: this.table,
            Key: marshall({
                user_id: userId.toString()
            })
        }

        const command: GetItemCommand = new GetItemCommand(input);

        const {Item} = await documentClient.send(command);

        return unmarshall(Item!!) as PrivateChatMapping
    }
}


export const telegramPrivateChatMappingRepository: TelegramPrivateChatMappingRepository = new TelegramPrivateChatMappingRepositoryImpl()
