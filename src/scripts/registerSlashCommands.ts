import * as dotenv from 'dotenv';
import { registerCommands } from '../util/registerCommands';
import * as config from '../../config.json';

// Load environment variables
dotenv.config();

// Get command line arguments
const args = process.argv.slice(2);
const isGlobal = args.includes('--global');

async function register() {
    try {
        if (!process.env.TOKEN) {
            throw new Error('Bot token not found in environment variables');
        }

        if (!process.env.CLIENT_ID) {
            throw new Error('Client ID not found in environment variables');
        }

        if (isGlobal) {
            // Register global commands
            console.log('Registering global slash commands...');
            await registerCommands(
                process.env.TOKEN,
                process.env.CLIENT_ID
            );
        } else {
            // Register guild commands
            console.log(`Registering guild slash commands for guild ${config.guildID}...`);
            await registerCommands(
                process.env.TOKEN,
                process.env.CLIENT_ID,
                config.guildID
            );
        }
    } catch (error) {
        console.error('Error registering slash commands:', error);
        process.exit(1);
    }
}

register(); 