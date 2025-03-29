import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as DatabaseController from '../../controllers/database';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('list-admins')
        .setDescription('List all admin users'),
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
            // Get all admin users
            const admins = await DatabaseController.getAllAdmins();
            if (!admins || admins.length === 0) {
                return {
                    success: true,
                    error: 'No admin users found.'
                };
            }

            // Format admin list
            const adminList = admins.map(admin => `• ${admin.username} (${admin.user_id})`).join('\n');
            return {
                success: true,
                error: `**Admin Users:**\n${adminList}`
            };
        } catch (error) {
            console.error('Error in list-admins command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 