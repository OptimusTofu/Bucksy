import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { SlashCommand, SlashCommandResult } from '../../types/slashCommand';
import { BucksyClient } from '../../types/bot';
import * as DatabaseController from '../../controllers/database';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('list-questions')
        .setDescription('List all questions in the collection'),
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
            // Get all questions
            const questions = await DatabaseController.getAllQuestions();
            if (!questions || questions.length === 0) {
                return {
                    success: true,
                    error: 'No questions found.'
                };
            }

            // Format question list
            const questionList = questions.map(question => `• ${question.text}`).join('\n');
            return {
                success: true,
                error: `**Questions:**\n${questionList}`
            };
        } catch (error) {
            console.error('Error in list-questions command:', error);
            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 