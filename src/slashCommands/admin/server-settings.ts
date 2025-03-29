import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as config from '../../../config.json';
import * as DatabaseController from '../../controllers/database';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('server-settings')
        .setDescription('Manage server settings')
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('The action to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'View Settings', value: 'view' },
                    { name: 'Set Welcome Channel', value: 'welcome' },
                    { name: 'Set Log Channel', value: 'log' },
                    { name: 'Set Mod Channel', value: 'mod' }
                ))
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel to set')
                .setRequired(false)) as SlashCommandBuilder,
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
            const action = interaction.options.getString('action', true);
            const channel = interaction.options.getChannel('channel');

            if (action === 'view') {
                // Get current settings
                const settings = await DatabaseController.getServerSettings(interaction.guildId!);
                if (!settings) {
                    return {
                        success: true,
                        error: 'No settings found for this server.'
                    };
                }

                // Format settings
                const settingsList = Object.entries(settings)
                    .filter(([key]) => key !== '_id')
                    .map(([key, value]) => `• ${key}: ${value}`)
                    .join('\n');

                return {
                    success: true,
                    error: `**Server Settings:**\n${settingsList}`
                };
            } else {
                if (!channel) {
                    return {
                        success: false,
                        error: 'Please specify a channel for this setting.'
                    };
                }

                // Update the setting
                const result = await DatabaseController.updateServerSetting(
                    interaction.guildId!,
                    action,
                    channel.id
                );

                if (result.success) {
                    return {
                        success: true,
                        error: `Updated ${action} channel to ${channel.name}.`
                    };
                } else {
                    return {
                        success: false,
                        error: result.error || 'Failed to update server setting.'
                    };
                }
            }
        } catch (error) {
            console.error('Error in server-settings command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 