import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ChannelType, TextChannel } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('manage-channels')
        .setDescription('Manage server channels')
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('The action to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'Create Channel', value: 'create' },
                    { name: 'Delete Channel', value: 'delete' },
                    { name: 'Edit Channel', value: 'edit' },
                    { name: 'List Channels', value: 'list' }
                )
        ).addStringOption(option =>
            option
                .setName('name')
                .setDescription('The name of the channel')
                .setRequired(false)
        ).addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel to manage')
                .setRequired(false)
        ).addStringOption(option =>
            option
                .setName('type')
                .setDescription('The type of channel')
                .setRequired(false)
                .addChoices(
                    { name: 'Text Channel', value: 'text' },
                    { name: 'Voice Channel', value: 'voice' },
                    { name: 'Category', value: 'category' },
                    { name: 'Announcement Channel', value: 'announcement' }
                )
        ).addStringOption(option =>
            option
                .setName('topic')
                .setDescription('The topic for the channel')
                .setRequired(false)
        ).addBooleanOption(option =>
            option
                .setName('nsfw')
                .setDescription('Whether the channel is NSFW')
                .setRequired(false)
        ) as SlashCommandBuilder,
    options: {
        guildOnly: true,
        permissions: [PermissionFlagsBits.ManageChannels],
        channel: {
            id: config.channels.admin.id,
            name: config.channels.admin.name
        }
    },
    async execute(interaction: ChatInputCommandInteraction, client: BucksyClient): Promise<SlashCommandResult> {
        try {
            const action = interaction.options.getString('action', true);
            const name = interaction.options.getString('name');
            const channel = interaction.options.getChannel('channel');
            const type = interaction.options.getString('type');
            const topic = interaction.options.getString('topic');
            const nsfw = interaction.options.getBoolean('nsfw');

            switch (action) {
                case 'create':
                    if (!name || !type) {
                        return {
                            success: false,
                            error: 'Please specify a name and type for the new channel.'
                        };
                    }
                    let channelType: ChannelType;
                    switch (type) {
                        case 'text':
                            channelType = ChannelType.GuildText;
                            break;
                        case 'voice':
                            channelType = ChannelType.GuildVoice;
                            break;
                        case 'category':
                            channelType = ChannelType.GuildCategory;
                            break;
                        case 'announcement':
                            channelType = ChannelType.GuildAnnouncement;
                            break;
                        default:
                            return {
                                success: false,
                                error: 'Invalid channel type.'
                            };
                    }
                    const newChannel = await interaction.guild?.channels.create({
                        name: name ?? undefined,
                        type: channelType,
                        topic: topic ?? undefined,
                        nsfw: nsfw ?? undefined
                    });
                    return {
                        success: true,
                        error: `Created channel ${newChannel?.name}.`
                    };

                case 'delete':
                    if (!channel) {
                        return {
                            success: false,
                            error: 'Please specify a channel to delete.'
                        };
                    }
                    await (channel as TextChannel).delete();
                    return {
                        success: true,
                        error: `Deleted channel ${channel.name}.`
                    };

                case 'edit':
                    if (!channel) {
                        return {
                            success: false,
                            error: 'Please specify a channel to edit.'
                        };
                    }
                    const editData: any = {};
                    if (name) editData.name = name;
                    if (topic) editData.topic = topic;
                    if (nsfw !== null) editData.nsfw = nsfw;
                    await (channel as TextChannel).edit(editData);
                    return {
                        success: true,
                        error: `Updated channel ${channel.name}.`
                    };

                case 'list':
                    const channels = interaction.guild?.channels.cache
                        .map(c => `• ${c.name} (${c.type})`)
                        .join('\n');
                    return {
                        success: true,
                        error: `**Server Channels:**\n${channels}`
                    };

                default:
                    return {
                        success: false,
                        error: 'Invalid action.'
                    };
            }
        } catch (error) {
            console.error('Error in manage-channels command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 