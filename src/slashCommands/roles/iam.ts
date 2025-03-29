import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, GuildMember, Role } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('iam')
        .setDescription('Add a role to your profile')
        .addStringOption(option =>
            option
                .setName('role')
                .setDescription('The role to add')
                .setRequired(true)) as SlashCommandBuilder,
    options: {
        guildOnly: true,
        permissions: []
    },
    async execute(interaction: ChatInputCommandInteraction, client: BucksyClient): Promise<SlashCommandResult> {
        try {
            if (!interaction.guild) {
                return {
                    success: false,
                    error: 'This command can only be used in a server.'
                };
            }

            const roleName = interaction.options.getString('role', true).toLowerCase();
            const member = interaction.member as GuildMember;

            // Check if it's a mod role
            if (config.modRoles.includes(roleName)) {
                return {
                    success: false,
                    error: "I'm sorry, I can't assign moderator roles."
                };
            }

            const role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === roleName);

            if (!role) {
                return {
                    success: false,
                    error: 'That role is not self-assignable.'
                };
            }

            // Check if user already has the role
            if (member.roles.cache.has(role.id)) {
                return {
                    success: false,
                    error: `You already have the **${roleName}** role.`
                };
            }

            // If it's a team role, remove other team roles first
            if (config.teams.includes(roleName)) {
                const teamRoles = member.roles.cache.filter(r => config.teams.includes(r.name.toLowerCase()));
                if (teamRoles.size > 0) {
                    await member.roles.remove(teamRoles);
                }
            }

            // Add the role
            await member.roles.add(role);

            return {
                success: true,
                error: `You now have the **${roleName}** role.`
            };
        } catch (error) {
            console.error('Error in iam command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 