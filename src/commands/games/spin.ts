import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import * as DatabaseController from '../../controllers/database';
import { emojis, generateRandomEmoji } from '../../util/slotMachine';
import * as config from '../../../config.json';
import { BotCommand, SlotResult, CommandResult, MessageContext } from '../../types';

const command: BotCommand = {
    name: "spin",
    description: "Spin a slot machine for rewards",
    usage: "",
    guildOnly: true,
    cooldown: 5,
    channel: {
        id: config.channels.slots.id,
        name: config.channels.slots.name,
    },
    async execute(msg: Message, args?: string[]): Promise<CommandResult> {
        try {
            // Create message context
            const context: MessageContext = {
                message: msg,
                member: msg.member,
                user: msg.author,
                guild: msg.guild,
                channel: msg.channel instanceof TextChannel ? msg.channel : null,
                args: args || [],
                commandName: 'spin',
                prefix: config.prefix[0]
            };

            // Check if user exists in the database
            const userRegistered = await DatabaseController.userExists(context.user.id);
            if (!userRegistered) {
                return {
                    success: false,
                    message: 'You need to register to the points registry first. Please type "!register"'
                };
            }

            // Deduct 1 point for spinning
            const balanceUpdated = await DatabaseController.updateBalance(context.user.id, -1);
            if (!balanceUpdated) {
                return {
                    success: false,
                    message: "There was an error updating your balance. Please try again later."
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
            const icon = context.user.displayAvatarURL();

            // Check if the channel is a text-based channel
            if (!context.channel) {
                return {
                    success: false,
                    message: "This command can only be used in a text channel."
                };
            }

            // If user didn't win, send a message and return
            if (!slotResult.win) {
                const slotMsg = new EmbedBuilder()
                    .setFooter({ text: "Try again.", iconURL: icon })
                    .addFields({ name: "Slot Machine Results", value: result, inline: true })
                    .setColor(0xffa500);

                await context.channel.send({ embeds: [slotMsg] });

                return {
                    success: true,
                    embed: slotMsg
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
            slotResult.embed = winMsg;

            // Update user's balance with winnings
            await DatabaseController.updateBalance(context.user.id, score);

            // Send win message
            await context.channel.send({ embeds: [winMsg] });

            return {
                success: true,
                embed: winMsg
            };
        } catch (error) {
            console.error("Error in spin command:", error);
            return {
                success: false,
                error: "An error occurred while processing your spin. Please try again later."
            };
        }
    },
};

export default command; 