import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import * as DatabaseController from '../../controllers/database';
import { BucksyClient, SlashCommand, SlashCommandResult } from '../../types';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your points balance'),

    options: {
        guildOnly: true,
        cooldown: 5
    },

    async execute(interaction: ChatInputCommandInteraction, client: BucksyClient): Promise<SlashCommandResult> {
        try {
            const userId = interaction.user.id;

            // Check if user exists in the database
            const userExists = await DatabaseController.userExists(userId);

            if (!userExists) {
                await interaction.reply({
                    content: 'You need to register to the points registry first. Please use the `/register` command.',
                    ephemeral: true
                });

                return {
                    success: false,
                    error: 'User not registered'
                };
            }

            // Get user's balance
            const balance = await DatabaseController.getBalance(userId);

            if (balance === null) {
                await interaction.reply({
                    content: 'There was an error retrieving your balance. Please try again later.',
                    ephemeral: true
                });

                return {
                    success: false,
                    error: 'Error retrieving balance'
                };
            }

            // Reply with balance
            await interaction.reply({
                content: `You currently have ${balance} ${config.emojis.pokecoin}`,
                ephemeral: false
            });

            return {
                success: true
            };
        } catch (error) {
            console.error('Error in balance command:', error);

            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 