import { Client, Collection, GatewayIntentBits, Events } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as config from '../config.json';
import * as DatabaseController from './controllers/database';
import * as SlashCommandController from './controllers/slashCommand';
import { registerCommands } from './util/registerCommands';
import { BucksyClient, BotCommand, BotEvent } from './types';

// Load environment variables
dotenv.config();

// Create bot instance
const bot = new BucksyClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Set bot configuration
bot.config = config;

// Determine the base directory for commands
// In production (compiled JS), we should look in the current directory
// In development (TS), we should look in the src directory
const baseDir = path.join(__dirname);

// Load commands
const commandsDir = path.join(baseDir, 'commands');
if (fs.existsSync(commandsDir)) {
    const commandFolders = fs.readdirSync(commandsDir);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsDir, folder);

        // Skip if not a directory
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const commandFiles = fs
            .readdirSync(folderPath)
            .filter((file) => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const command = require(filePath).default;

            if (command) {
                bot.commands.set(command.name, command);
                console.log(`Loaded command: ${command.name}`);
            } else {
                console.warn(`Command at ${filePath} has no default export`);
            }
        }
    }
} else {
    console.warn(`Commands directory not found at ${commandsDir}`);
}

// Load slash commands
bot.slashCommands = SlashCommandController.loadSlashCommands();

// Load events
const eventsDir = path.join(baseDir, 'events');
if (fs.existsSync(eventsDir)) {
    const eventFiles = fs
        .readdirSync(eventsDir)
        .filter((file) => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsDir, file);
        const event = require(filePath).default;

        if (event) {
            if (event.once) {
                bot.once(event.name, (...args) => event.execute(...args, bot));
            } else {
                bot.on(event.name, (...args) => event.execute(...args, bot));
            }
            console.log(`Loaded event: ${event.name}`);
        } else {
            console.warn(`Event at ${filePath} has no default export`);
        }
    }
} else {
    console.warn(`Events directory not found at ${eventsDir}`);
}

// Add interaction create event handler
bot.on(Events.InteractionCreate, async (interaction) => {
    await SlashCommandController.handleInteraction(interaction, bot);
});

// Initialize database and start the bot
async function startBot() {
    try {
        // Initialize database connection
        const dbInitialized = await DatabaseController.initializeDB();
        if (!dbInitialized) {
            console.error("Failed to initialize database. Exiting...");
            process.exit(1);
        }

        // Login to Discord
        await bot.login(process.env.TOKEN);
        console.log(`${bot.user?.username} is online!`);

        // Register slash commands
        if (process.env.NODE_ENV === 'development') {
            // Register guild commands in development (faster updates)
            await registerCommands(
                process.env.TOKEN || '',
                bot.user?.id || '',
                config.guildID
            );
        } else {
            // Register global commands in production
            await registerCommands(
                process.env.TOKEN || '',
                bot.user?.id || ''
            );
        }
    } catch (error) {
        console.error("Error starting the bot:", error);
        process.exit(1);
    }
}

startBot();

export { bot }; 