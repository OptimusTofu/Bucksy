import {
    Message,
    GuildMember,
    User,
    Guild,
    TextChannel,
    EmbedBuilder,
    PermissionResolvable,
    MessageReaction,
    PartialMessageReaction,
    PartialUser,
    ClientEvents
} from 'discord.js';

/**
 * Interface for message context
 */
export interface MessageContext {
    /** The message that triggered the command */
    message: Message;

    /** The guild member who sent the message */
    member: GuildMember | null;

    /** The user who sent the message */
    user: User;

    /** The guild where the message was sent */
    guild: Guild | null;

    /** The channel where the message was sent */
    channel: TextChannel | null;

    /** The command arguments */
    args: string[];

    /** The command name */
    commandName: string;

    /** The prefix used */
    prefix: string;
}

/**
 * Interface for command execution result
 */
export interface CommandResult {
    /** Whether the command was successful */
    success: boolean;

    /** The message to send back */
    message?: string;

    /** The embed to send back */
    embed?: EmbedBuilder;

    /** The error message if the command failed */
    error?: string;
}

/**
 * Interface for permission check result
 */
export interface PermissionCheckResult {
    /** Whether the user has the required permissions */
    hasPermission: boolean;

    /** The missing permissions */
    missingPermissions?: PermissionResolvable[];

    /** The error message if the user doesn't have the required permissions */
    errorMessage?: string;
}

/**
 * Interface for reaction context
 */
export interface ReactionContext {
    /** The reaction that was added or removed */
    reaction: MessageReaction | PartialMessageReaction;

    /** The user who added or removed the reaction */
    user: User | PartialUser;

    /** The guild member who added or removed the reaction */
    member: GuildMember | null;

    /** The guild where the reaction was added or removed */
    guild: Guild | null;
}

/**
 * Type for event handler functions
 */
export type EventHandler<K extends keyof ClientEvents> = (...args: ClientEvents[K]) => void | Promise<void>; 