import {
    SlashCommandBuilder,
    CommandInteraction,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    PermissionResolvable
} from 'discord.js';
import { BucksyClient } from './bot';

/**
 * Interface for slash command options
 */
export interface SlashCommandOptions {
    /** Whether the command can only be used in a guild */
    guildOnly?: boolean;

    /** Whether the command is enabled */
    enabled?: boolean;

    /** Cooldown in seconds */
    cooldown?: number;

    /** Required permissions to use the command */
    permissions?: PermissionResolvable[];
}

/**
 * Interface for slash command execution result
 */
export interface SlashCommandResult {
    /** Whether the command was successful */
    success: boolean;

    /** Error message if the command failed */
    error?: string;
}

/**
 * Interface for slash commands
 */
export interface SlashCommand {
    /** The command data for registration */
    data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

    /** Command options */
    options?: SlashCommandOptions;

    /** Function to execute when the command is invoked */
    execute: (interaction: ChatInputCommandInteraction, client: BucksyClient) => Promise<SlashCommandResult>;

    /** Function to handle autocomplete interactions */
    autocomplete?: (interaction: AutocompleteInteraction, client: BucksyClient) => Promise<void>;
} 