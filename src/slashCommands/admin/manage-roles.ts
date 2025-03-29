import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, GuildMember, Role } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('manage-roles')
        .setDescription('Manage roles for a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to manage roles for')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('The action to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'Add Role', value: 'add' },
                    { name: 'Remove Role', value: 'remove' }
                ))
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('The role to add or remove')
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
            const action = interaction.options.getString('action', true);
            const roleOption = interaction.options.getRole('role', true);

            if (!interaction.guild) {
                return {
                    success: false,
                    error: 'This command can only be used in a server.'
                };
            }

            // Get the member object
            const member = await interaction.guild.members.fetch(targetUser.id);
            if (!member) {
                return {
                    success: false,
                    error: 'Could not find the specified user in this server.'
                };
            }

            // Get the actual Role object
            const role = await interaction.guild.roles.fetch(roleOption.id);
            if (!role) {
                return {
                    success: false,
                    error: 'Could not find the specified role.'
                };
            }

            // Check if the bot can manage the role
            const botMember = await interaction.guild.members.fetch(client.user!.id);
            if (!role.editable || role.position >= botMember.roles.highest.position) {
                return {
                    success: false,
                    error: 'I cannot manage this role. It may be higher than my highest role.'
                };
            }

            // Perform the action
            if (action === 'add') {
                if (member.roles.cache.has(role.id)) {
                    return {
                        success: false,
                        error: `${targetUser.username} already has the ${role.name} role.`
                    };
                }
                await member.roles.add(role);
                return {
                    success: true,
                    error: `Added ${role.name} role to ${targetUser.username}.`
                };
            } else {
                if (!member.roles.cache.has(role.id)) {
                    return {
                        success: false,
                        error: `${targetUser.username} does not have the ${role.name} role.`
                    };
                }
                await member.roles.remove(role);
                return {
                    success: true,
                    error: `Removed ${role.name} role from ${targetUser.username}.`
                };
            }
        } catch (error) {
            console.error('Error in manage-roles command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 