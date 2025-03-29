import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as DatabaseController from '../../controllers/database';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('list-shinies')
        .setDescription('List all shinies in the collection'),
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
            // Get all shinies
            const shinies = await DatabaseController.getAllShinies();
            if (!shinies || shinies.length === 0) {
                return {
                    success: true,
                    error: 'No shinies found.'
                };
            }

            // Format shiny list
            const shinyList = shinies.map(shiny => `• ${shiny.pokemon}`).join('\n');
            return {
                success: true,
                error: `**Shinies:**\n${shinyList}`
            };
        } catch (error) {
            console.error('Error in list-shinies command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 