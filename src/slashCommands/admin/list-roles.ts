import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('list-roles')
        .setDescription('List all roles for a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to list roles for')
                .setRequired(true)) as SlashCommandBuilder,
    options: {
        guildOnly: true,
        permissions: [PermissionFlagsBits.ManageRoles],
        channel: {
            id: config.channels.admin.id,
            name: config.channels.admin.name
        }
    },
    async execute(interaction: ChatInputCommandInteraction, client: BucksyClient): Promise<SlashCommandResult> {
        try {
            const targetUser = interaction.options.getUser('user', true);

            // Get the member object
            const member = await interaction.guild?.members.fetch(targetUser.id);
            if (!member) {
                return {
                    success: false,
                    error: 'Could not find the specified user in this server.'
                };
            }

            // Get all roles except @everyone
            const roles = member.roles.cache
                .filter(role => role.id !== interaction.guild?.id)
                .map(role => `• ${role.name}`)
                .join('\n');

            if (!roles) {
                return {
                    success: true,
                    error: `${targetUser.username} has no roles.`
                };
            }

            return {
                success: true,
                error: `**Roles for ${targetUser.username}:**\n${roles}`
            };
        } catch (error) {
            console.error('Error in list-roles command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 