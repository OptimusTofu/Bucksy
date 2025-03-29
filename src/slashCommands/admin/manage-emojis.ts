import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('manage-emojis')
        .setDescription('Manage server emojis')
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('The action to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'Add Emoji', value: 'add' },
                    { name: 'Remove Emoji', value: 'remove' },
                    { name: 'List Emojis', value: 'list' }
                )
        ).addStringOption(option =>
            option
                .setName('name')
                .setDescription('The name for the emoji')
                .setRequired(false)
        ).addStringOption(option =>
            option
                .setName('url')
                .setDescription('The URL of the emoji image')
                .setRequired(false)
        ).addStringOption(option =>
            option
                .setName('emoji')
                .setDescription('The emoji to remove')
                .setRequired(false)
        ) as SlashCommandBuilder,
    options: {
        guildOnly: true,
        permissions: [PermissionFlagsBits.ManageEmojisAndStickers],
        channel: {
            id: config.channels.admin.id,
            name: config.channels.admin.name
        }
    },
    async execute(interaction: ChatInputCommandInteraction, client: BucksyClient): Promise<SlashCommandResult> {
        try {
            const action = interaction.options.getString('action', true);
            const name = interaction.options.getString('name');
            const url = interaction.options.getString('url');
            const emoji = interaction.options.getString('emoji');

            switch (action) {
                case 'add':
                    if (!name || !url) {
                        return {
                            success: false,
                            error: 'Please specify a name and URL for the new emoji.'
                        };
                    }
                    const newEmoji = await interaction.guild?.emojis.create({
                        name,
                        attachment: url
                    });
                    return {
                        success: true,
                        error: `Added emoji ${newEmoji?.name}.`
                    };

                case 'remove':
                    if (!emoji) {
                        return {
                            success: false,
                            error: 'Please specify an emoji to remove.'
                        };
                    }
                    const emojiToRemove = interaction.guild?.emojis.cache.find(e => e.name === emoji);
                    if (!emojiToRemove) {
                        return {
                            success: false,
                            error: 'Could not find the specified emoji.'
                        };
                    }
                    await emojiToRemove.delete();
                    return {
                        success: true,
                        error: `Removed emoji ${emojiToRemove.name}.`
                    };

                case 'list':
                    const emojis = interaction.guild?.emojis.cache
                        .map(e => `• ${e.name} ${e}`)
                        .join('\n');
                    return {
                        success: true,
                        error: `**Server Emojis:**\n${emojis}`
                    };

                default:
                    return {
                        success: false,
                        error: 'Invalid action.'
                    };
            }
        } catch (error) {
            console.error('Error in manage-emojis command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 