import { Message } from 'discord.js';
import { BucksyClient } from '../types';
import * as config from '../../config.json';

/**
 * Checks if a message starts with any of the configured prefixes
 * @param msg The message to check
 * @param client The bot client
 * @returns Whether the message starts with a prefix
 */
export const prefixExists = (msg: Message, client: BucksyClient): boolean => {
    if (!msg || !msg.content) {
        return false;
    }

    const prefixes = client.config.prefix || config.prefix;

    return prefixes.some(prefix => msg.content.startsWith(prefix));
}; 