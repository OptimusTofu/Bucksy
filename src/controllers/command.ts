import { Message } from 'discord.js';
import { BucksyClient, CommandResult } from '../types';
import { prefixExists } from '../util/prefixExists';

/**
 * Listens for commands in messages and executes them
 * @param msg The message to process
 * @param client The bot client
 * @returns The result of the command execution
 */
export const listen = async (msg: Message, client: BucksyClient): Promise<CommandResult | void> => {
    try {
        if (msg.author.bot) return;
        if (!prefixExists(msg, client)) return;

        const args = msg.content.trim().split(/ +/);
        const prefixUsed = client.config.prefix.find(p => msg.content.startsWith(p)) || '!';
        const commandName = args.shift()?.slice(prefixUsed.length).toLowerCase();

        if (!commandName) return;

        const command = client.commands.get(commandName) ||
            client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        // Check if command can only be used in a guild
        if (command.guildOnly && !msg.guild) {
            return {
                success: false,
                message: 'This command can only be used in a server.'
            };
        }

        // Check if command should only be used in a specific channel
        if (command.channel && msg.channel.id !== command.channel.id) {
            return {
                success: false,
                message: `This command can only be used in the #${command.channel.name} channel.`
            };
        }

        // Execute the command
        return await command.execute(msg, args);
    } catch (error) {
        console.error('Error executing command:', error);
        return {
            success: false,
            error: 'An error occurred while executing the command.'
        };
    }
}; 