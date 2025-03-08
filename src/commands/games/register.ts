import { Message } from 'discord.js';
import * as DatabaseController from '../../controllers/database';
import { BotCommand, CommandResult } from '../../types';

const command: BotCommand = {
    name: 'register',
    description: 'Register for the games system to get points and play games',
    usage: '',
    guildOnly: true,
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

            if (userExists) {
                await msg.reply('You are already registered to the points registry. Try "!balance" or play a game.');
                return {
                    success: false,
                    message: 'User already registered'
                };
            }

            const registered = await DatabaseController.addUser(user_id);

            if (!registered) {
                await msg.reply('There was an error registering you. Please try again later.');
                return {
                    success: false,
                    message: 'Error registering user'
                };
            }

            await msg.reply('Welcome to the game registry!');

            return {
                success: true,
                message: 'User registered successfully'
            };
        } catch (error) {
            console.error('Error in register command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    },
};

export default command; 