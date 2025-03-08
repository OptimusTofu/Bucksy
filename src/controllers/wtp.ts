import { Message, TextChannel, AttachmentBuilder } from 'discord.js';
import { BucksyClient } from '../types';
import * as config from '../../config.json';
import * as cron from 'cron';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as DatabaseController from './database';

// Store the cron job
let wtpJob: cron.CronJob | null = null;

// Store the current Pokemon
let currentPokemon: {
    name: string;
    imageUrl: string;
    silhouetteUrl: string;
    revealed: boolean;
} | null = null;

/**
 * Fetches a random Pokemon from the PokeAPI
 * @returns A random Pokemon
 */
async function fetchRandomPokemon(): Promise<any> {
    try {
        // Get a random Pokemon ID (1-898)
        const randomId = Math.floor(Math.random() * 898) + 1;

        // Fetch the Pokemon data
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);

        if (response.status !== 200) {
            throw new Error(`Failed to fetch Pokemon: ${response.status}`);
        }

        return {
            name: response.data.name,
            imageUrl: response.data.sprites.other['official-artwork'].front_default,
        };
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
        throw error;
    }
}

/**
 * Creates a silhouette of a Pokemon image
 * @param imageUrl The URL of the Pokemon image
 * @returns The path to the silhouette image
 */
async function createSilhouette(imageUrl: string): Promise<string> {
    try {
        // Download the image
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        // Save the image to a temporary file
        const tempPath = path.join(process.cwd(), 'temp.png');
        fs.writeFileSync(tempPath, buffer);

        // Create the silhouette using sharp
        const sharp = require('sharp');
        const silhouettePath = path.join(process.cwd(), 'silhouette.png');

        await sharp(tempPath)
            .threshold(1) // Convert to black and white
            .negate() // Invert colors to get a black silhouette
            .toFile(silhouettePath);

        // Clean up the temporary file
        fs.unlinkSync(tempPath);

        return silhouettePath;
    } catch (error) {
        console.error('Error creating silhouette:', error);
        throw error;
    }
}

/**
 * Posts a Who's That Pokemon challenge
 * @param client The bot client
 */
async function postChallenge(client: BucksyClient): Promise<void> {
    try {
        // Get the guild
        const guild = client.guilds.cache.get(config.guildID);
        if (!guild) {
            console.error('Guild not found');
            return;
        }

        // Get the WTP channel
        const channel = guild.channels.cache.get(config.channels.guess.id);
        if (!channel || !channel.isTextBased()) {
            console.error('WTP channel not found or not a text channel');
            return;
        }

        // Fetch a random Pokemon
        const pokemon = await fetchRandomPokemon();

        // Create a silhouette
        const silhouettePath = await createSilhouette(pokemon.imageUrl);

        // Store the current Pokemon
        currentPokemon = {
            name: pokemon.name,
            imageUrl: pokemon.imageUrl,
            silhouetteUrl: silhouettePath,
            revealed: false,
        };

        // Post the challenge
        const attachment = new AttachmentBuilder(silhouettePath);
        await (channel as TextChannel).send({
            content: config.guessMsg,
            files: [attachment],
        });

        console.log(`Posted Who's That Pokemon challenge: ${pokemon.name}`);

        // Set a timer to reveal the Pokemon after 5 minutes
        setTimeout(() => revealPokemon(client), 5 * 60 * 1000);
    } catch (error) {
        console.error('Error posting Who\'s That Pokemon challenge:', error);
    }
}

/**
 * Reveals the current Pokemon
 * @param client The bot client
 */
async function revealPokemon(client: BucksyClient): Promise<void> {
    try {
        if (!currentPokemon || currentPokemon.revealed) {
            return;
        }

        // Mark the Pokemon as revealed
        currentPokemon.revealed = true;

        // Get the guild
        const guild = client.guilds.cache.get(config.guildID);
        if (!guild) {
            console.error('Guild not found');
            return;
        }

        // Get the WTP channel
        const channel = guild.channels.cache.get(config.channels.guess.id);
        if (!channel || !channel.isTextBased()) {
            console.error('WTP channel not found or not a text channel');
            return;
        }

        // Post the reveal
        const attachment = new AttachmentBuilder(currentPokemon.imageUrl);
        await (channel as TextChannel).send({
            content: `It's ${currentPokemon.name.charAt(0).toUpperCase() + currentPokemon.name.slice(1)}!`,
            files: [attachment],
        });

        console.log(`Revealed Pokemon: ${currentPokemon.name}`);

        // Clean up the silhouette file
        if (fs.existsSync(currentPokemon.silhouetteUrl)) {
            fs.unlinkSync(currentPokemon.silhouetteUrl);
        }
    } catch (error) {
        console.error('Error revealing Pokemon:', error);
    }
}

/**
 * Starts the Who's That Pokemon game
 * @param client The bot client
 */
export const start = async (client: BucksyClient): Promise<void> => {
    try {
        console.log('Starting Who\'s That Pokemon game...');

        // Stop existing job if it exists
        if (wtpJob) {
            wtpJob.stop();
        }

        // Create a new cron job to post a challenge at the configured times
        wtpJob = new cron.CronJob(
            config.guessTime,
            () => postChallenge(client),
            null,
            true,
            'America/New_York'
        );

        // Start the job
        wtpJob.start();

        console.log(`Who's That Pokemon scheduled for ${config.guessTime}`);

        // Post an initial challenge
        await postChallenge(client);
    } catch (error) {
        console.error('Error starting Who\'s That Pokemon game:', error);
    }
};

/**
 * Listens for guesses in the Who's That Pokemon channel
 * @param msg The message to process
 * @param client The bot client
 */
export const listen = async (msg: Message, client: BucksyClient): Promise<void> => {
    try {
        if (msg.author.bot) return;

        // Check if the channel is a text-based channel
        if (!msg.channel || !('send' in msg.channel)) return;

        // Check if there's a current Pokemon
        if (!currentPokemon || currentPokemon.revealed) {
            return;
        }

        // Check if the guess is correct
        const guess = msg.content.toLowerCase().trim();
        if (guess === currentPokemon.name.toLowerCase()) {
            // Mark the Pokemon as revealed
            currentPokemon.revealed = true;

            // Award points to the user
            const userId = msg.author.id;
            const userExists = await DatabaseController.userExists(userId);

            if (userExists) {
                await DatabaseController.updateBalance(userId, 100);
                await msg.reply(`Correct! It's ${currentPokemon.name.charAt(0).toUpperCase() + currentPokemon.name.slice(1)}! You've earned 100 ${config.emojis.pokecoin}`);
            } else {
                await msg.reply(`Correct! It's ${currentPokemon.name.charAt(0).toUpperCase() + currentPokemon.name.slice(1)}! Register with !register to earn points next time.`);
            }

            // Post the actual image
            const attachment = new AttachmentBuilder(currentPokemon.imageUrl);
            await msg.channel.send({
                files: [attachment],
            });

            // Clean up the silhouette file
            if (fs.existsSync(currentPokemon.silhouetteUrl)) {
                fs.unlinkSync(currentPokemon.silhouetteUrl);
            }

            console.log(`User ${msg.author.tag} correctly guessed ${currentPokemon.name}`);
        }
    } catch (error) {
        console.error('Error in Who\'s That Pokemon controller:', error);
    }
}; 