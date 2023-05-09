import {documentClient} from "../aws/dynamo"
import {
    AttributeValue,
    GetItemCommand,
    GetItemCommandInput,
    PutItemCommand,
    PutItemCommandInput,
    QueryCommand
} from "@aws-sdk/client-dynamodb"
import {QueryCommandInput, ScanCommand, ScanCommandInput} from "@aws-sdk/lib-dynamodb"
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb"

export interface TelegramCode {
    code: string,
    chat_id: string,
    created_at: number,
    updated_at?: number | undefined,
    code_type: TelegramCodeType,
    user_id?: string | undefined,
    address?: string | undefined,
    subscription_id?: string | undefined,
    invite_link?: string | undefined,
    user_private_chat_id?: string | undefined,
    invite_link_refresh_count?: number | undefined
}

export enum TelegramCodeType {
    INVITE,
    BINDING
}

export interface TelegramCodeRepository {

    findBindingBySubscriptionId(subscriptionId: string): Promise<TelegramCode | undefined>

    findBindingBySubscriptionIdWithScan(subscriptionId: string): Promise<TelegramCode | undefined>

    getByAddressAndSubscriptionId(address: string, subscriptionId: string): Promise<TelegramCode | undefined>

    getByCode(code: string): Promise<TelegramCode | undefined>

    save(telegramCode: TelegramCode): Promise<void>

    update(telegramCode: TelegramCode): Promise<void>

}

export class TelegramCodeRepositoryImpl implements TelegramCodeRepository {

    private table: string = 'telegram-codes';

    // todo fix, not working now
    async findBindingBySubscriptionId(subscriptionId: string): Promise<TelegramCode | undefined> {

        console.log(`Start find subscription binding for id ${subscriptionId}`);

        const input: QueryCommandInput = {
            TableName: this.table,
            Limit: 2,
            KeyConditionExpression: 'code_type = :t and subscription_id = :s',
            FilterExpression: 'attribute_exists(chat_id)',
            ExpressionAttributeValues: marshall({
                ':t': TelegramCodeType.BINDING,
                ':s': subscriptionId
            })
        }

        const command: QueryCommand = new QueryCommand(input);

        const result = await documentClient.send(command);
        console.log(`findBindingBySubscriptionId result: ${result}`);

        if (!result?.Items || result.Items.length === 0) {
            console.log(`Can't find binding`)
            return undefined;
        }

        if (result.Items.length > 1) {
            throw new Error('Found two binded chats illegal state');
        }

        console.log(`Found binding for subscription ${subscriptionId}`);

        return unmarshall(result.Items[0]) as TelegramCode;
    }

    async findBindingBySubscriptionIdWithScan(subscriptionId: string): Promise<TelegramCode | undefined> {

        console.log(`Start find subscription binding with scan for id ${subscriptionId}`);
        const input: ScanCommandInput = {
            TableName: this.table,
        };

        const command: ScanCommand = new ScanCommand(input);

        const result = await documentClient.send(command);
        console.log(`findBindingBySubscriptionIdWithScan result:`);
        console.log(result);

        if (!result?.Items || result.Items.length === 0) {
            console.log(`Can't find binding`)
            return undefined;
        }

        const items = result.Items
            .map(i => i as TelegramCode)
            .filter(item => item.subscription_id === subscriptionId)
            .filter(item => item.code_type === TelegramCodeType.BINDING)
            .filter(item => item.chat_id !== undefined);

        console.log(items);

        if (items.length > 1) {
            throw new Error('Found two binded chats illegal state');
        }

        console.log(`Found binding for subscription ${subscriptionId}`);

        return items[0];
    }

    async getByAddressAndSubscriptionId(address: string, subscriptionId: string): Promise<TelegramCode | undefined> {

        const input: GetItemCommandInput = {
            TableName: this.table,
            Key: marshall({
                address: address,
                subscription_id: subscriptionId
            })
        };

        const command: GetItemCommand = new GetItemCommand(input);

        const {Item} = await documentClient.send(command);
        if (!Item) {
            console.log(`Can't find binding for address ${address} and subscriptionId ${subscriptionId}`);
            return undefined;
        }

        console.log(`Found telegramCode for address ${address} and subscriptionId ${subscriptionId}`);

        return unmarshall(Item) as TelegramCode
    }

    async getByCode(code: string): Promise<TelegramCode | undefined> {

        console.log(`Get telegram code by code ${code}`);

        const input: GetItemCommandInput = {
            TableName: this.table,
            Key: marshall({
                code: code
            })
        };

        const command: GetItemCommand = new GetItemCommand(input);

        const {Item} = await documentClient.send(command);
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

        console.log(`Start update item`);
        console.log(telegramCode);

        const input: PutItemCommandInput = {
            TableName: this.table,
            Item: marshall(telegramCode)
        }

        const command: PutItemCommand = new PutItemCommand(input);

        await documentClient.send(command);

        console.log(`Finish update item`);
        console.log(telegramCode);
    }

}

export const telegramCodeRepository: TelegramCodeRepository = new TelegramCodeRepositoryImpl();