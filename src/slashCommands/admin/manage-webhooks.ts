import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, Webhook } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('manage-webhooks')
        .setDescription('Manage server webhooks')
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('The action to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'Create Webhook', value: 'create' },
                    { name: 'Delete Webhook', value: 'delete' },
                    { name: 'List Webhooks', value: 'list' }
                ))
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel to manage webhooks for')
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('The name for the webhook')
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName('avatar')
                .setDescription('The URL of the webhook avatar')
                .setRequired(false)) as SlashCommandBuilder,
    options: {
        guildOnly: true,
        permissions: [PermissionFlagsBits.ManageWebhooks],
        channel: {
            id: config.channels.admin.id,
            name: config.channels.admin.name
        }
    },
    async execute(interaction: ChatInputCommandInteraction, client: BucksyClient): Promise<SlashCommandResult> {
        try {
            const action = interaction.options.getString('action', true);
            const channel = interaction.options.getChannel('channel');
            const name = interaction.options.getString('name');
            const avatar = interaction.options.getString('avatar');

            switch (action) {
                case 'create':
                    if (!channel || !name) {
                        return {
                            success: false,
                            error: 'Please specify a channel and name for the new webhook.'
                        };
                    }
                    if (!(channel instanceof TextChannel)) {
                        return {
                            success: false,
                            error: 'Webhooks can only be created in text channels.'
                        };
                    }
                    const webhook = await channel.createWebhook({
                        name,
                        avatar: avatar
                    });
                    return {
                        success: true,
                        error: `Created webhook ${webhook.name} in ${channel.name}.`
                    };

                case 'delete':
                    if (!channel) {
                        return {
                            success: false,
                            error: 'Please specify a channel to delete webhooks from.'
                        };
                    }
                    if (!(channel instanceof TextChannel)) {
                        return {
                            success: false,
                            error: 'Webhooks can only be managed in text channels.'
                        };
                    }
                    const webhooks = await channel.fetchWebhooks();
                    if (webhooks.size === 0) {
                        return {
                            success: false,
                            error: `No webhooks found in ${channel.name}.`
                        };
                    }
                    await Promise.all(webhooks.map((w: Webhook) => w.delete()));
                    return {
                        success: true,
                        error: `Deleted all webhooks in ${channel.name}.`
                    };

                case 'list':
                    if (!channel) {
                        return {
                            success: false,
                            error: 'Please specify a channel to list webhooks from.'
                        };
                    }
                    if (!(channel instanceof TextChannel)) {
                        return {
                            success: false,
                            error: 'Webhooks can only be managed in text channels.'
                        };
                    }
                    const channelWebhooks = await channel.fetchWebhooks();
                    if (channelWebhooks.size === 0) {
                        return {
                            success: true,
                            error: `No webhooks found in ${channel.name}.`
                        };
                    }
                    const webhookList = channelWebhooks.map((w: Webhook) =>
                        `• ${w.name} (ID: ${w.id})`
                    ).join('\n');
                    return {
                        success: true,
                        error: `**Webhooks in ${channel.name}:**\n${webhookList}`
                    };

                default:
                    return {
                        success: false,
                        error: 'Invalid action.'
                    };
            }
        } catch (error) {
            console.error('Error in manage-webhooks command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 