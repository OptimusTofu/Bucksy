import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as DatabaseController from '../../controllers/database';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('remove-question')
        .setDescription('Remove a question from the collection')
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('The question text to remove')
                .setRequired(true)) as SlashCommandBuilder,
    options: {
        guildOnly: true,
        permissions: [PermissionFlagsBits.ManageRoles],
        channel: {
            id: config.channels.admin.id,
            name: config.channels.admin.name
        }
    },
    async execute(interaction: ChatInputCommandInteraction, client: BucksyClient): Promise<SlashCommandResult> {
        try {
            const text = interaction.options.getString('text', true);

            // Check if question exists
            const exists = await DatabaseController.questionExists(text);
            if (!exists) {
                return {
                    success: false,
                    error: `Oops, this question doesn't exist!`
                };
            }

            // Remove the question
            const result = await DatabaseController.removeQuestion(text);
            if (result.success) {
                return {
                    success: true,
                    error: `Question has been removed successfully!`
                };
            } else {
                return {
                    success: false,
                    error: result.error || 'Failed to remove question.'
                };
            }
        } catch (error) {
            console.error('Error in remove-question command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 