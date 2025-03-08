import {
    Client,
    Collection,
    Message,
    ClientOptions,
    GuildMember,
    TextChannel,
    User,
    Guild,
    ClientEvents
} from 'discord.js';
import { Config } from './config';

/**
 * Interface for command arguments
 */
export interface CommandArgs {
    /** Raw arguments as a string array */
    args: string[];

    /** Command name that was used */
    commandName: string;

    /** The prefix that was used to invoke the command */
    prefix: string;
}

/**
 * Interface for bot commands
 */
export interface BotCommand {
    /** Command name used to invoke the command */
    name: string;

    /** Description of what the command does */
    description: string;

    /** Usage example for the command */
    usage: string;

    /** Whether the command can only be used in a guild */
    guildOnly?: boolean;

    /** Specific channel the command should be used in */
    channel?: {
        id: string;
        name: string;
    };

    /** Aliases for the command */
    aliases?: string[];

    /** Cooldown in seconds */
    cooldown?: number;

    /** Required permissions to use the command */
    permissions?: string[];

    /** Function to execute when the command is invoked */
    execute: (message: Message, args?: string[]) => Promise<any>;
}

/**
 * Interface for bot events
 */
export interface BotEvent<K extends keyof ClientEvents = any> {
    /** Event name from discord.js */
    name: K;

    /** Whether the event should only be triggered once */
    once?: boolean;

    /** Function to execute when the event is triggered */
    execute: (...args: ClientEvents[K]) => void;
}

/**
 * Extended Client class with custom properties
 */
export class BucksyClient extends Client {
    /** Collection of commands */
    public commands: Collection<string, BotCommand>;

    /** Collection of command cooldowns */
    public cooldowns: Collection<string, Collection<string, number>>;

    /** Bot configuration */
    public config: Config;

    constructor(options: ClientOptions) {
        super(options);
        this.commands = new Collection();
        this.cooldowns = new Collection();
        this.config = {} as Config;
    }
} 