import { Client, Collection, GatewayIntentBits, Events } from 'discord.js';
import * as fs from 'fs';
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

// Load slash commands
bot.slashCommands = SlashCommandController.loadSlashCommands();

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