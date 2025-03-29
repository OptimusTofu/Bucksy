import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as config from '../../../config.json';
import * as DatabaseController from '../../controllers/database';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Manage server automod settings')
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('The action to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'View Settings', value: 'view' },
                    { name: 'Enable Automod', value: 'enable' },
                    { name: 'Disable Automod', value: 'disable' },
                    { name: 'Add Word', value: 'add-word' },
                    { name: 'Remove Word', value: 'remove-word' }
                )) as SlashCommandBuilder,
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
            const word = interaction.options.getString('word');

            switch (action) {
                case 'view':
                    const settings = await DatabaseController.getAutomodSettings(interaction.guildId!);
                    if (!settings) {
                        return {
                            success: true,
                            error: 'No automod settings found for this server.'
                        };
                    }
                    const settingsList = Object.entries(settings)
                        .filter(([key]) => key !== '_id')
                        .map(([key, value]) => `• ${key}: ${value}`)
                        .join('\n');
                    return {
                        success: true,
                        error: `**Automod Settings:**\n${settingsList}`
                    };

                case 'enable':
                    const enableResult = await DatabaseController.updateAutomodSetting(
                        interaction.guildId!,
                        'enabled',
                        true
                    );
                    if (enableResult.success) {
                        return {
                            success: true,
                            error: 'Automod has been enabled.'
                        };
                    } else {
                        return {
                            success: false,
                            error: enableResult.error || 'Failed to enable automod.'
                        };
                    }

                case 'disable':
                    const disableResult = await DatabaseController.updateAutomodSetting(
                        interaction.guildId!,
                        'enabled',
                        false
                    );
                    if (disableResult.success) {
                        return {
                            success: true,
                            error: 'Automod has been disabled.'
                        };
                    } else {
                        return {
                            success: false,
                            error: disableResult.error || 'Failed to disable automod.'
                        };
                    }

                case 'add-word':
                    if (!word) {
                        return {
                            success: false,
                            error: 'Please specify a word to add.'
                        };
                    }
                    const addResult = await DatabaseController.addAutomodWord(
                        interaction.guildId!,
                        word
                    );
                    if (addResult.success) {
                        return {
                            success: true,
                            error: `Added word "${word}" to automod list.`
                        };
                    } else {
                        return {
                            success: false,
                            error: addResult.error || 'Failed to add word.'
                        };
                    }

                case 'remove-word':
                    if (!word) {
                        return {
                            success: false,
                            error: 'Please specify a word to remove.'
                        };
                    }
                    const removeResult = await DatabaseController.removeAutomodWord(
                        interaction.guildId!,
                        word
                    );
                    if (removeResult.success) {
                        return {
                            success: true,
                            error: `Removed word "${word}" from automod list.`
                        };
                    } else {
                        return {
                            success: false,
                            error: removeResult.error || 'Failed to remove word.'
                        };
                    }

                case 'list-words':
                    const words = await DatabaseController.getAutomodWords(interaction.guildId!);
                    if (!words || words.length === 0) {
                        return {
                            success: true,
                            error: 'No words in automod list.'
                        };
                    }
                    const wordList = words.map(w => `• ${w}`).join('\n');
                    return {
                        success: true,
                        error: `**Automod Words:**\n${wordList}`
                    };

                default:
                    return {
                        success: false,
                        error: 'Invalid action.'
                    };
            }
        } catch (error) {
            console.error('Error in automod command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 