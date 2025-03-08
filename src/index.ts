import { Client, Collection, GatewayIntentBits } from 'discord.js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as config from '../config.json';
import * as DatabaseController from './controllers/database';
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

// Load commands
const commands = fs.readdirSync('./src/commands');
for (const folder of commands) {
    const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`).default;
        bot.commands.set(command.name, command);
    }
}

// Load events
const eventFiles = fs
    .readdirSync('./src/events')
    .filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`).default;

    if (event.once) {
        bot.once(event.name, (...args) => event.execute(...args, bot));
    } else {
        bot.on(event.name, (...args) => event.execute(...args, bot));
    }
}

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
    } catch (error) {
        console.error("Error starting the bot:", error);
        process.exit(1);
    }
}

startBot();

export { bot }; 