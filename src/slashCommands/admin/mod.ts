import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, GuildMember } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as config from '../../../config.json';
import * as DatabaseController from '../../controllers/database';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('mod')
        .setDescription('Perform moderation actions')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to moderate')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('The action to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'Kick', value: 'kick' },
                    { name: 'Ban', value: 'ban' },
                    { name: 'Timeout', value: 'timeout' },
                    { name: 'Warn', value: 'warn' }
                ))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for the action')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('duration')
                .setDescription('Duration in minutes (for timeout)')
                .setRequired(false)) as SlashCommandBuilder,
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
            const action = interaction.options.getString('action', true);
            const reason = interaction.options.getString('reason', true);
            const duration = interaction.options.getInteger('duration');

            // Get the member object
            const member = await interaction.guild?.members.fetch(targetUser.id);
            if (!member) {
                return {
                    success: false,
                    error: 'Could not find the specified user in this server.'
                };
            }

            // Check if the bot can moderate the user
            if (!member.moderatable) {
                return {
                    success: false,
                    error: 'I cannot moderate this user. They may have higher permissions than me.'
                };
            }

            // Perform the action
            switch (action) {
                case 'kick':
                    await member.kick(reason);
                    return {
                        success: true,
                        error: `Kicked ${targetUser.username} for: ${reason}`
                    };

                case 'ban':
                    await member.ban({ reason });
                    return {
                        success: true,
                        error: `Banned ${targetUser.username} for: ${reason}`
                    };

                case 'timeout':
                    if (!duration) {
                        return {
                            success: false,
                            error: 'Please specify a duration for the timeout.'
                        };
                    }
                    await member.timeout(duration * 60 * 1000, reason);
                    return {
                        success: true,
                        error: `Timed out ${targetUser.username} for ${duration} minutes for: ${reason}`
                    };

                case 'warn':
                    // Log the warning
                    await DatabaseController.addWarning(targetUser.id, reason, interaction.user.id);
                    return {
                        success: true,
                        error: `Warned ${targetUser.username} for: ${reason}`
                    };

                default:
                    return {
                        success: false,
                        error: 'Invalid moderation action.'
                    };
            }
        } catch (error) {
            console.error('Error in mod command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 