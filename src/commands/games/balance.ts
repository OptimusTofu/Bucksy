import { Message } from 'discord.js';
import * as DatabaseController from '../../controllers/database';
import * as config from '../../../config.json';
import { BotCommand, CommandResult } from '../../types';

const command: BotCommand = {
    name: 'balance',
    description: 'Fetch a user\'s game points balance.',
    aliases: ['bal'],
    guildOnly: true,
    usage: '',
    async execute(msg: Message): Promise<CommandResult> {
        try {
            const user_id = msg.member?.user.id;

            if (!user_id) {
                return {
                    success: false,
                    message: 'Could not determine your user ID. Please try again.'
                };
            }

            const userExists = await DatabaseController.userExists(user_id);

            if (!userExists) {
                await msg.reply('You need to register to the points registry first. Please type "!register"');
                return {
                    success: false,
                    message: 'User not registered'
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

            await msg.reply(`You currently have ${balance} ${config.emojis.pokecoin}`);

            return {
                success: true,
                message: `Balance: ${balance}`
            };
        } catch (error) {
            console.error('Error in balance command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    },
};

export default command; 