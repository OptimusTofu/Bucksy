import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import * as DatabaseController from '../../controllers/database';
import { emojis, generateRandomEmoji } from '../../util/slotMachine';
import { BucksyClient, SlashCommand, SlashCommandResult, SlotResult } from '../../types';
import * as config from '../../../config.json';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('spin')
        .setDescription('Spin a slot machine for rewards'),

    options: {
        guildOnly: true,
        cooldown: 5
    },

    async execute(interaction: ChatInputCommandInteraction, client: BucksyClient): Promise<SlashCommandResult> {
        try {
            const userId = interaction.user.id;

            // Check if user exists in the database
            const userExists = await DatabaseController.userExists(userId);

            if (!userExists) {
                await interaction.reply({
                    content: 'You need to register to the points registry first. Please use the `/register` command.',
                    ephemeral: true
                });

                return {
                    success: false,
                    error: 'User not registered'
                };
            }

            // Deduct 1 point for spinning
            const balanceUpdated = await DatabaseController.updateBalance(userId, -1);

            if (!balanceUpdated) {
                await interaction.reply({
                    content: 'There was an error updating your balance. Please try again later.',
                    ephemeral: true
                });

                return {
                    success: false,
                    error: 'Error updating balance'
                };
            }

            // Generate random emojis for the slot machine
            const first = generateRandomEmoji(emojis.length);
            const second = generateRandomEmoji(emojis.length);
            const third = generateRandomEmoji(emojis.length);

            // Create slot result
            const slotResult: SlotResult = {
                win: first === second && second === third,
                emojis: [first, second, third]
            };

            const result = slotResult.emojis.join('');
            const icon = interaction.user.displayAvatarURL();

            // If user didn't win, send a message and return
            if (!slotResult.win) {
                const slotMsg = new EmbedBuilder()
                    .setFooter({ text: "Try again.", iconURL: icon })
                    .addFields({ name: "Slot Machine Results", value: result, inline: true })
                    .setColor(0xffa500);

                await interaction.reply({ embeds: [slotMsg] });

                return {
                    success: true
                };
            }

            // Handle win scenario
            let winMsg: EmbedBuilder;
            let score: number;

            switch (first) {
                case emojis[0]:
                    score = 50;
                    winMsg = new EmbedBuilder()
                        .setFooter({
                            text: "You Won! 50 PokeCoins have been added to your account.",
                            iconURL: icon
                        })
                        .addFields({
                            name: `Slot Machine Results ${config.emojis.pokecoin}`,
                            value: result,
                            inline: true
                        })
                        .setColor(0x006600);
                    break;
                case emojis[5]:
                    score = 100;
                    winMsg = new EmbedBuilder()
                        .setFooter({
                            text: "You Won! 100 PokeCoins have been added to your account.",
                            iconURL: icon
                        })
                        .addFields({
                            name: `Slot Machine Results ${config.emojis.pokecoin}`,
                            value: result,
                            inline: true
                        })
                        .setColor(0x006600);
                    break;
                case emojis[9]:
                    score = 500;
                    winMsg = new EmbedBuilder()
                        .setFooter({
                            text: "You Won! 500 PokeCoins have been added to your account.",
                            iconURL: icon
                        })
                        .addFields({
                            name: `Slot Machine Results ${config.emojis.pokecoin}`,
                            value: result,
                            inline: true
                        })
                        .setColor(0x006600);
                    break;
                case emojis[12]:
                    score = 1000;
                    winMsg = new EmbedBuilder()
                        .setFooter({
                            text: "You Won! 1000 PokeCoins have been added to your account.",
                            iconURL: icon
                        })
                        .addFields({
                            name: `Slot Machine Results ${config.emojis.pokecoin}`,
                            value: result,
                            inline: true
                        })
                        .setColor(0x006600);
                    break;
                case emojis[14]:
                    score = 5000;
                    winMsg = new EmbedBuilder()
                        .setFooter({
                            text: "You Won! 5000 PokeCoins have been added to your account.",
                            iconURL: icon
                        })
                        .addFields({
                            name: `Slot Machine Results ${config.emojis.pokecoin}`,
                            value: result,
                            inline: true
                        })
                        .setColor(0x006600);
                    break;
                default:
                    score = 10;
                    winMsg = new EmbedBuilder()
                        .setFooter({
                            text: "You Won! 10 PokeCoins have been added to your account.",
                            iconURL: icon
                        })
                        .addFields({
                            name: `Slot Machine Results ${config.emojis.pokecoin}`,
                            value: result,
                            inline: true
                        })
                        .setColor(0x006600);
            }

            // Update slot result with score
            slotResult.score = score;

            // Update user's balance with winnings
            await DatabaseController.updateBalance(userId, score);

            // Send win message
            await interaction.reply({ embeds: [winMsg] });

            return {
                success: true
            };
        } catch (error) {
            console.error('Error in spin command:', error);

            return {
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            };
        }
    }
};

export default command; 