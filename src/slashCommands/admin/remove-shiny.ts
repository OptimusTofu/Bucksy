import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as DatabaseController from '../../controllers/database';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('remove-shiny')
        .setDescription('Remove a shiny from the collection')
        .addStringOption(option =>
            option
                .setName('pokemon')
                .setDescription('The pokemon to remove')
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
            const pokemon = interaction.options.getString('pokemon', true).toLowerCase();

            // Check if shiny exists
            const exists = await DatabaseController.shinyExists(pokemon);
            if (!exists) {
                return {
                    success: false,
                    error: `Oops, ${pokemon} is not registered to the shiny list!`
                };
            }

            // Remove the shiny
            const result = await DatabaseController.removeShiny(pokemon);
            if (result.success) {
                return {
                    success: true,
                    error: `${pokemon} has been removed from the shiny list!`
                };
            } else {
                return {
                    success: false,
                    error: result.error || 'Failed to remove shiny from the list.'
                };
            }
        } catch (error) {
            console.error('Error in remove-shiny command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 