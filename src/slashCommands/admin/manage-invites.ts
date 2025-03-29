import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('manage-invites')
        .setDescription('Manage server invites')
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('The action to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'Create Invite', value: 'create' },
                    { name: 'Delete Invite', value: 'delete' },
                    { name: 'List Invites', value: 'list' }
                ))
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel to create the invite for')
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName('code')
                .setDescription('The invite code to delete')
                .setRequired(false))
        .addIntegerOption(option =>
            option
                .setName('max-age')
                .setDescription('Maximum age of the invite in seconds (0 for never)')
                .setRequired(false))
        .addIntegerOption(option =>
            option
                .setName('max-uses')
                .setDescription('Maximum number of uses (0 for unlimited)')
                .setRequired(false)) as SlashCommandBuilder,
    options: {
        guildOnly: true,
        permissions: [PermissionFlagsBits.CreateInstantInvite],
        channel: {
            id: config.channels.admin.id,
            name: config.channels.admin.name
        }
    },
    async execute(interaction: ChatInputCommandInteraction, client: BucksyClient): Promise<SlashCommandResult> {
        try {
            const action = interaction.options.getString('action', true);
            const channel = interaction.options.getChannel('channel');
            const code = interaction.options.getString('code');
            const maxAge = interaction.options.getInteger('max-age');
            const maxUses = interaction.options.getInteger('max-uses');

            switch (action) {
                case 'create':
                    if (!channel) {
                        return {
                            success: false,
                            error: 'Please specify a channel to create the invite for.'
                        };
                    }
                    if (!(channel instanceof TextChannel)) {
                        return {
                            success: false,
                            error: 'Invites can only be created in text channels.'
                        };
                    }
                    const invite = await channel.createInvite({
                        maxAge: maxAge || 0,
                        maxUses: maxUses || 0
                    });
                    return {
                        success: true,
                        error: `Created invite: ${invite.url}`
                    };

                case 'delete':
                    if (!code) {
                        return {
                            success: false,
                            error: 'Please specify an invite code to delete.'
                        };
                    }
                    const inviteToDelete = await interaction.guild?.invites.fetch(code);
                    if (!inviteToDelete) {
                        return {
                            success: false,
                            error: 'Could not find the specified invite.'
                        };
                    }
                    await inviteToDelete.delete();
                    return {
                        success: true,
                        error: `Deleted invite ${code}.`
                    };

                case 'list':
                    const invites = await interaction.guild?.invites.fetch();
                    if (!invites || invites.size === 0) {
                        return {
                            success: true,
                            error: 'No active invites found.'
                        };
                    }
                    const inviteList = invites.map(i =>
                        `• ${i.url} (${i.maxUses} uses, ${i.maxAge ? `${i.maxAge}s` : 'never'} expires)`
                    ).join('\n');
                    return {
                        success: true,
                        error: `**Active Invites:**\n${inviteList}`
                    };

                default:
                    return {
                        success: false,
                        error: 'Invalid action.'
                    };
            }
        } catch (error) {
            console.error('Error in manage-invites command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 