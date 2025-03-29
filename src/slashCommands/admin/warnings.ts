import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as DatabaseController from '../../controllers/database';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to view warnings for')
                .setRequired(true)) as SlashCommandBuilder,
    options: {
        guildOnly: true,
        permissions: [PermissionFlagsBits.Administrator],
        channel: {
            id: config.channels.admin.id,
            name: config.channels.admin.name
        }
    },
    async execute(interaction: ChatInputCommandInteraction, client: BucksyClient): Promise<SlashCommandResult> {
        try {
            const targetUser = interaction.options.getUser('user', true);

            // Get warnings for the user
            const warnings = await DatabaseController.getWarnings(targetUser.id);
            if (!warnings || warnings.length === 0) {
                return {
                    success: true,
                    error: `${targetUser.username} has no warnings.`
                };
            }

            // Format warnings
            const warningsList = warnings.map((warning: { reason: string; timestamp: Date }) => {
                const date = new Date(warning.timestamp).toLocaleString();
                return `• ${warning.reason} (${date})`;
            }).join('\n');

            return {
                success: true,
                error: `**Warnings for ${targetUser.username}:**\n${warningsList}`
            };
        } catch (error) {
            console.error('Error in warnings command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 