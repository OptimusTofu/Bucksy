import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, User } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as DatabaseController from '../../controllers/database';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('remove-admin')
        .setDescription('Remove admin status from a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to remove admin status from')
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

            // Check if user is admin
            const isAdmin = await DatabaseController.isAdmin(targetUser.id);
            if (!isAdmin) {
                return {
                    success: false,
                    error: `${targetUser.username} is not an admin!`
                };
            }

            // Remove admin status
            const result = await DatabaseController.removeAdminUser(targetUser.id);
            if (result.success) {
                return {
                    success: true,
                    error: `${targetUser.username} is no longer an admin!`
                };
            } else {
                return {
                    success: false,
                    error: result.error || 'Failed to remove admin status.'
                };
            }
        } catch (error) {
            console.error('Error in remove-admin command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 