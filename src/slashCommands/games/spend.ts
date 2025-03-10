import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import * as DatabaseController from '../../controllers/database';
import { BucksyClient, SlashCommand, SlashCommandResult } from '../../types';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('spend')
        .setDescription('Spend a specified amount of your points for a prize')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of points to spend')
                .setRequired(true)
                .setMinValue(1)
        ) as SlashCommandBuilder,

    options: {
        guildOnly: true,
        cooldown: 5
    },

    async execute(interaction: ChatInputCommandInteraction, client: BucksyClient): Promise<SlashCommandResult> {
        try {
            const userId = interaction.user.id;
            const points = interaction.options.getInteger('amount');

            if (!points || points <= 0) {
                await interaction.reply({
                    content: 'You must specify a positive amount of points to spend.',
                    ephemeral: true
                });

                return {
                    success: false,
                    error: 'Invalid amount'
                };
            }

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

            // Check if user has enough points
            if (points > balance) {
                await interaction.reply({
                    content: `You only have ${balance} ${config.emojis.pokecoin}, better go play more games!`,
                    ephemeral: true
                });

                return {
                    success: false,
                    error: 'Insufficient balance'
                };
            }

            // Deduct points
            const updated = await DatabaseController.updateBalance(userId, -points);

            if (!updated) {
                await interaction.reply({
                    content: 'There was an error updating your balance. Please try again later.',
                    ephemeral: true
                });

                return {
                    success: false,
                    error: 'Error updating balance'
                };
            }

            // Get updated balance
            const newBalance = await DatabaseController.getBalance(userId);

            // Reply with success message
            await interaction.reply({
                content: `You have spent ${points} ${config.emojis.pokecoin}. You now have ${newBalance} ${config.emojis.pokecoin} remaining.`,
                ephemeral: false
            });

            return {
                success: true
            };
        } catch (error) {
            console.error('Error in spend command:', error);

            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 