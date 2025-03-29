import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, Role } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('manage-server-roles')
        .setDescription('Manage server roles')
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('The action to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'Create Role', value: 'create' },
                    { name: 'Delete Role', value: 'delete' },
                    { name: 'Edit Role', value: 'edit' },
                    { name: 'List Roles', value: 'list' }
                ))
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('The name of the role')
                .setRequired(false))
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('The role to manage')
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName('color')
                .setDescription('The color for the role (hex code)')
                .setRequired(false))
        .addBooleanOption(option =>
            option
                .setName('hoist')
                .setDescription('Whether to hoist the role')
                .setRequired(false))
        .addBooleanOption(option =>
            option
                .setName('mentionable')
                .setDescription('Whether the role is mentionable')
                .setRequired(false)) as SlashCommandBuilder,
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
            if (!interaction.guild) {
                return {
                    success: false,
                    error: 'This command can only be used in a server.'
                };
            }

            const action = interaction.options.getString('action', true);
            const name = interaction.options.getString('name');
            const roleOption = interaction.options.getRole('role');
            const color = interaction.options.getString('color');
            const hoist = interaction.options.getBoolean('hoist') ?? undefined;
            const mentionable = interaction.options.getBoolean('mentionable') ?? undefined;

            switch (action) {
                case 'create':
                    if (!name) {
                        return {
                            success: false,
                            error: 'Please specify a name for the new role.'
                        };
                    }
                    const newRole = await interaction.guild.roles.create({
                        name,
                        color: color ? parseInt(color.replace('#', ''), 16) : undefined,
                        hoist,
                        mentionable
                    });
                    return {
                        success: true,
                        error: `Created role ${newRole.name}.`
                    };

                case 'delete':
                    if (!roleOption) {
                        return {
                            success: false,
                            error: 'Please specify a role to delete.'
                        };
                    }
                    const roleToDelete = await interaction.guild.roles.fetch(roleOption.id);
                    if (!roleToDelete) {
                        return {
                            success: false,
                            error: 'Could not find the specified role.'
                        };
                    }
                    await roleToDelete.delete();
                    return {
                        success: true,
                        error: `Deleted role ${roleToDelete.name}.`
                    };

                case 'edit':
                    if (!roleOption) {
                        return {
                            success: false,
                            error: 'Please specify a role to edit.'
                        };
                    }
                    const roleToEdit = await interaction.guild.roles.fetch(roleOption.id);
                    if (!roleToEdit) {
                        return {
                            success: false,
                            error: 'Could not find the specified role.'
                        };
                    }
                    const editData: any = {};
                    if (name) editData.name = name;
                    if (color) editData.color = parseInt(color.replace('#', ''), 16);
                    if (hoist !== undefined) editData.hoist = hoist;
                    if (mentionable !== undefined) editData.mentionable = mentionable;
                    await roleToEdit.edit(editData);
                    return {
                        success: true,
                        error: `Updated role ${roleToEdit.name}.`
                    };

                case 'list':
                    const roles = interaction.guild.roles.cache
                        .filter(r => r.id !== interaction.guild!.id)
                        .map(r => `• ${r.name} (${r.id})`)
                        .join('\n');
                    return {
                        success: true,
                        error: `**Server Roles:**\n${roles}`
                    };

                default:
                    return {
                        success: false,
                        error: 'Invalid action.'
                    };
            }
        } catch (error) {
            console.error('Error in manage-server-roles command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 