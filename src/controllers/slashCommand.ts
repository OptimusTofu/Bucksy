import {
    Interaction,
    ChatInputCommandInteraction,
    AutocompleteInteraction,
    Collection,
    PermissionsBitField,
    PermissionResolvable
} from 'discord.js';
import { BucksyClient, SlashCommand, SlashCommandResult } from '../types';
import * as fs from 'fs';
import * as path from 'path';

// Store cooldowns
const cooldowns = new Collection<string, Collection<string, number>>();

/**
 * Loads all slash commands
 * @returns A collection of slash commands
 */
export function loadSlashCommands(): Collection<string, SlashCommand> {
    const commands = new Collection<string, SlashCommand>();
    const commandsPath = path.join(__dirname, '..', 'slashCommands');

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
            .filter(file => file.endsWith('.js') || file.endsWith('.ts'));

        // Loop through each command file
        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const command: SlashCommand = require(filePath).default;

            if (!command.data) {
                console.warn(`The command at ${filePath} is missing a required "data" property.`);
                continue;
            }

            // Add the command to the collection
            commands.set(command.data.name, command);
        }
    }

    return commands;
}

/**
 * Handles slash command interactions
 * @param interaction The interaction to handle
 * @param client The bot client
 */
export async function handleInteraction(interaction: Interaction, client: BucksyClient): Promise<void> {
    try {
        // Handle autocomplete interactions
        if (interaction.isAutocomplete()) {
            await handleAutocomplete(interaction, client);
            return;
        }

        // Handle command interactions
        if (interaction.isChatInputCommand()) {
            await handleCommand(interaction, client);
            return;
        }
    } catch (error) {
        console.error('Error handling interaction:', error);

        // Try to respond with an error message
        if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    }
}

/**
 * Handles autocomplete interactions
 * @param interaction The autocomplete interaction
 * @param client The bot client
 */
async function handleAutocomplete(interaction: AutocompleteInteraction, client: BucksyClient): Promise<void> {
    const command = client.slashCommands.get(interaction.commandName);

    if (!command || !command.autocomplete) return;

    try {
        await command.autocomplete(interaction, client);
    } catch (error) {
        console.error(`Error handling autocomplete for command ${interaction.commandName}:`, error);
    }
}

/**
 * Handles command interactions
 * @param interaction The command interaction
 * @param client The bot client
 */
async function handleCommand(interaction: ChatInputCommandInteraction, client: BucksyClient): Promise<void> {
    const command = client.slashCommands.get(interaction.commandName);

    if (!command) return;

    // Check if command is guild-only
    if (command.options?.guildOnly && !interaction.guild) {
        await interaction.reply({
            content: 'This command can only be used in a server!',
            ephemeral: true
        });
        return;
    }

    // Check if command is enabled
    if (command.options?.enabled === false) {
        await interaction.reply({
            content: 'This command is currently disabled!',
            ephemeral: true
        });
        return;
    }

    // Check permissions
    if (command.options?.permissions && interaction.guild) {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const missingPermissions = command.options.permissions.filter(
            (permission: PermissionResolvable) => !member.permissions.has(permission)
        );

        if (missingPermissions.length > 0) {
            await interaction.reply({
                content: `You don't have the required permissions to use this command!`,
                ephemeral: true
            });
            return;
        }
    }

    // Handle cooldowns
    if (command.options?.cooldown) {
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name)!;
        const cooldownAmount = command.options.cooldown * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                await interaction.reply({
                    content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.data.name}\` command.`,
                    ephemeral: true
                });
                return;
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    }

    // Execute the command
    try {
        const result = await command.execute(interaction, client);

        // If the command didn't reply, reply with the result
        if (!interaction.replied && !interaction.deferred) {
            if (result.success) {
                // Command was successful but didn't reply
                // This shouldn't normally happen, but just in case
                await interaction.reply({
                    content: 'Command executed successfully!',
                    ephemeral: true
                });
            } else {
                // Command failed
                await interaction.reply({
                    content: result.error || 'There was an error while executing this command!',
                    ephemeral: true
                });
            }
        }
    } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    }
} 