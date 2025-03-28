import { REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { SlashCommand } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import * as config from '../../config.json';

/**
 * Registers slash commands with Discord
 * @param token The bot token
 * @param clientId The client ID
 * @param guildId The guild ID (optional, for guild-specific commands)
 */
export async function registerCommands(
    token: string,
    clientId: string,
    guildId?: string
): Promise<void> {
    try {
        console.log('Started refreshing application (/) commands.');

        // Create a new REST instance
        const rest = new REST({ version: '10' }).setToken(token);

        // Get all command files
        const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
        const commandsPath = path.join(__dirname, '..', 'slashCommands');

        if (!fs.existsSync(commandsPath)) {
            console.warn(`Slash commands directory not found at ${commandsPath}`);
            return;
        }

        // Get all subdirectories in the commands directory
        const commandFolders = fs.readdirSync(commandsPath);

        // Loop through each folder
        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);

            // Skip if not a directory
            if (!fs.statSync(folderPath).isDirectory()) continue;

            // Get all command files in the folder
            const commandFiles = fs
                .readdirSync(folderPath)
                .filter(file => file.endsWith('.js'));

            // Loop through each command file
            for (const file of commandFiles) {
                try {
                    const filePath = path.join(folderPath, file);
                    const command = require(filePath).default;

                    if (!command) {
                        console.warn(`The command at ${filePath} has no default export.`);
                        continue;
                    }

                    if (!command.data) {
                        console.warn(`The command at ${filePath} is missing a required "data" property.`);
                        continue;
                    }

                    // Add the command to the commands array
                    commands.push(command.data.toJSON());
                    console.log(`Registered command: ${command.data.name}`);
                } catch (error) {
                    console.error(`Error loading slash command file ${file} for registration:`, error);
                }
            }
        }

        if (commands.length === 0) {
            console.warn('No commands found to register.');
            return;
        }

        // Register the commands
        if (guildId) {
            // Guild commands
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            );
            console.log(`Successfully registered ${commands.length} application commands for guild ${guildId}.`);
        } else {
            // Global commands
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands }
            );
            console.log(`Successfully registered ${commands.length} global application commands.`);
        }
    } catch (error) {
        console.error('Error registering commands:', error);
    }
} 