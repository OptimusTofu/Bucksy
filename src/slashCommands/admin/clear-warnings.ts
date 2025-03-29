import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as DatabaseController from '../../controllers/database';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('clear-warnings')
        .setDescription('Clear warnings for a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to clear warnings for')
                .setRequired(true)) as SlashCommandBuilder,
    options: {
        guildOnly: true,
        permissions: [PermissionFlagsBits.ModerateMembers],
        channel: {
            id: config.channels.admin.id,
            name: config.channels.admin.name
        }
    },
    async execute(interaction: ChatInputCommandInteraction, client: BucksyClient): Promise<SlashCommandResult> {
        try {
            const targetUser = interaction.options.getUser('user', true);

            // Check if user has warnings
            const warnings = await DatabaseController.getWarnings(targetUser.id);
            if (!warnings || warnings.length === 0) {
                return {
                    success: false,
                    error: `${targetUser.username} has no warnings to clear.`
                };
            }

            // Clear warnings
            const result = await DatabaseController.clearWarnings(targetUser.id);
            if (result.success) {
                return {
                    success: true,
                    error: `Cleared all warnings for ${targetUser.username}.`
                };
            } else {
                return {
                    success: false,
                    error: result.error || 'Failed to clear warnings.'
                };
            }
        } catch (error) {
            console.error('Error in clear-warnings command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 