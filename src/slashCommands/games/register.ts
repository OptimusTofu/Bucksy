import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import * as DatabaseController from '../../controllers/database';
import { BucksyClient, SlashCommand, SlashCommandResult } from '../../types';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register for the games system to get points and play games'),

    options: {
        guildOnly: true,
        cooldown: 10
    },

    async execute(interaction: ChatInputCommandInteraction, client: BucksyClient): Promise<SlashCommandResult> {
        try {
            const userId = interaction.user.id;

            // Check if user already exists in the database
            const userExists = await DatabaseController.userExists(userId);

            if (userExists) {
                await interaction.reply({
                    content: 'You are already registered to the points registry. Try `/balance` or play a game.',
                    ephemeral: true
                });

                return {
                    success: false,
                    error: 'User already registered'
                };
            }

            // Register the user
            const registered = await DatabaseController.addUser(userId);

            if (!registered) {
                await interaction.reply({
                    content: 'There was an error registering you. Please try again later.',
                    ephemeral: true
                });

                return {
                    success: false,
                    error: 'Error registering user'
                };
            }

            // Reply with success message
            await interaction.reply({
                content: 'Welcome to the game registry! You can now play games and earn points.',
                ephemeral: false
            });

            return {
                success: true
            };
        } catch (error) {
            console.error('Error in register command:', error);

            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 