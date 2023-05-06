import { randomBytes } from "crypto";
import dotenv from 'dotenv';

dotenv.config();

export const AWS_REGION = 'us-east-1';
export const SOMETHING_WRONG_MESSAGE = 'Some';

export const unixTimestamp = (date: number = Date.now()): number => {
    return Math.floor(date / 1000)
}

export const generateCode = (): string => {
    const buffer = randomBytes(32);
    const randomString = buffer.toString('hex');
    return randomString;
}