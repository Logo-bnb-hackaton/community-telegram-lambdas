import { documentClient } from "../aws/dynamo"
import { GetItemCommand, GetItemCommandInput, PutItemCommand, PutItemCommandInput, QueryCommand } from "@aws-sdk/client-dynamodb"
import { QueryCommandInput } from "@aws-sdk/lib-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"


export interface TelegramCode {
    code: string,
    chat_id: string,
    created_at: number,
    updated_at?: number,
    type: TelegramCodeType,
    user_id?: string,
    address?: string,
    subscription_id?: string,
    invite_link?: string,
    user_private_chat_id?: string,
    invite_link_refresh_count?: number
}

export enum TelegramCodeType {
    INVITE,
    BINDING
}

export interface TelegramCodeRepository {

    findBindingBySubscriptionId(subscriptionId: string): Promise<TelegramCode | undefined>

    getByAddressAndSubscriptionId(address: string, subscriptionId: string): Promise<TelegramCode | undefined>

    getByCode(code: string): Promise<TelegramCode | undefined>

    save(telegramCode: TelegramCode): Promise<void>

    update(telegramCode: TelegramCode): Promise<void>

}

class TelegramCodeRepositoryImpl implements TelegramCodeRepository {

    private table: string = 'telegram-codes';

    async findBindingBySubscriptionId(subscriptionId: string): Promise<TelegramCode | undefined> {

        console.log(`Start find subscription binding for id ${subscriptionId}`);

        const input: QueryCommandInput = {
            TableName: this.table,
            Limit: 2,
            KeyConditionExpression: 'type = :t and subscription_id = :s and attribute_exists(chat_id)',
            ExpressionAttributeValues: {
                ':t': TelegramCodeType.BINDING,
                ':s': subscriptionId
            }
        }

        const command: QueryCommand = new QueryCommand(input);

        const { Items } = await documentClient.send(command);

        if (!Items || Items.length === 0) {
            console.log(`Can't find binding`)
            return undefined;
        }

        if (Items.length > 1) {
            throw new Error('Found two binded chats illegal state');
        }

        console.log(`Found binding for subscription ${subscriptionId}`);

        return unmarshall(Items[0]) as TelegramCode;
    }
    
    async getByAddressAndSubscriptionId(address: string, subscriptionId: string): Promise<TelegramCode> {
        
        const input: GetItemCommandInput = {
            TableName: this.table,
            Key: marshall({
                address: address,
                subscription_id: subscriptionId
            })
        };

        const command: GetItemCommand = new GetItemCommand(input);

        const { Item } = await documentClient.send(command);
        if (!Item) {
            console.log(`Can't find binding for address ${address} and subscriptionId ${subscriptionId}`);
            return undefined;
        }

        console.log(`Found telegramCode for address ${address} and subscriptionId ${subscriptionId}`);

        return unmarshall(Item) as TelegramCode
    }

    async getByCode(code: string): Promise<TelegramCode> {

        console.log(`Get telegram code by code ${code}`);
        
        const input: GetItemCommandInput = {
            TableName: this.table,
            Key: marshall({
                code: code
            })
        };

        const command: GetItemCommand = new GetItemCommand(input);

        const { Item } = await documentClient.send(command);
        if (!Item) {
            console.log(`Can't find telegramCode for ${code}`);
            return undefined;
        }

        console.log(`Found telegramCode entity for ${code}`);

        return unmarshall(Item) as TelegramCode
    }

    async save(telegramCode: TelegramCode): Promise<void> {

        console.log(`Try to save new telegram code ${telegramCode.code}`)

        const input: PutItemCommandInput = {
            TableName: this.table,
            Item: marshall(telegramCode)
        }

        const command: PutItemCommand = new PutItemCommand(input);

        await documentClient.send(command);

        console.log(`Telegram code ${telegramCode.code} saved successfully`);
    }

    async update(telegramCode: TelegramCode): Promise<void> {

        console.log(`Start update item ${telegramCode}`);
        
        const input: PutItemCommandInput = {
            TableName: this.table,
            Item: marshall(telegramCode)
        }

        const command: PutItemCommand = new PutItemCommand(input);

        await documentClient.send(command);

        console.log(`Finish update item ${telegramCode}`)
    }
    
}

const telegramCodeRepository: TelegramCodeRepository = new TelegramCodeRepositoryImpl();
export { telegramCodeRepository }