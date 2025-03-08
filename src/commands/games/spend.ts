import { Message } from 'discord.js';
import * as DatabaseController from '../../controllers/database';
import * as config from '../../../config.json';
import { BotCommand, CommandResult } from '../../types';

const command: BotCommand = {
    name: 'spend',
    description: 'Spend a specified amount of a user\'s game points for a prize.',
    usage: '<points>',
    guildOnly: true,
    async execute(msg: Message, args?: string[]): Promise<CommandResult> {
        try {
            if (!args || args.length === 0) {
                await msg.reply('You must specify an amount of coins to spend.');
                return {
                    success: false,
                    message: 'No amount specified'
                };
            }

            const points = Number(args[0]);
            const isNumber = /^\d+$/.test(args[0]);
            const user_id = msg.member?.user.id;

            if (!user_id) {
                return {
                    success: false,
                    message: 'Could not determine your user ID. Please try again.'
                };
            }

            const userExists = await DatabaseController.userExists(user_id);

            if (!userExists) {
                await msg.reply('You need to register to the points registry first. Please type `!register`');
                return {
                    success: false,
                    message: 'User not registered'
                };
            }

            if (!isNumber) {
                await msg.reply('You must specify an amount of coins as digits only.');
                return {
                    success: false,
                    message: 'Invalid amount format'
                };
            }

            const balance = await DatabaseController.getBalance(user_id);

            if (balance === null) {
                await msg.reply('There was an error retrieving your balance. Please try again later.');
                return {
                    success: false,
                    message: 'Error retrieving balance'
                };
            }

            if (points > balance) {
                await msg.reply(`You only have ${balance} ${config.emojis.pokecoin}, better go play more games!`);
                return {
                    success: false,
                    message: 'Insufficient balance'
                };
            }

            const updated = await DatabaseController.updateBalance(user_id, -points);

            if (!updated) {
                await msg.reply('There was an error updating your balance. Please try again later.');
                return {
                    success: false,
                    message: 'Error updating balance'
                };
            }

            const newBalance = await DatabaseController.getBalance(user_id);

            if (newBalance === null) {
                await msg.reply('There was an error retrieving your updated balance. Please check with `!balance`.');
                return {
                    success: false,
                    message: 'Error retrieving updated balance'
                };
            }

            await msg.reply(`You now have ${newBalance} ${config.emojis.pokecoin} remaining.`);

            return {
                success: true,
                message: `Spent ${points} coins. New balance: ${newBalance}`
            };
        } catch (error) {
            console.error('Error in spend command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    },
};

export default command; 