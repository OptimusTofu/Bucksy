import { User, GuildMember, Message, EmbedBuilder } from 'discord.js';

/**
 * Interface for slot machine result
 */
export interface SlotResult {
    /** Whether the spin was a win */
    win: boolean;

    /** The emojis that were spun */
    emojis: string[];

    /** The score/points won (if win is true) */
    score?: number;

    /** The message embed to display the result */
    embed?: EmbedBuilder;
}

/**
 * Interface for balance operation
 */
export interface BalanceOperation {
    /** User ID */
    userId: string;

    /** Amount to add or subtract */
    amount: number;

    /** Operation type */
    type: 'add' | 'subtract';

    /** Reason for the operation */
    reason?: string;

    /** Guild member who performed the operation */
    member?: GuildMember;

    /** Message that triggered the operation */
    message?: Message;
}

/**
 * Interface for purchase
 */
export interface Purchase {
    /** Item being purchased */
    item: string;

    /** Cost of the item */
    cost: number;

    /** User ID making the purchase */
    userId: string;

    /** Guild member making the purchase */
    member?: GuildMember;

    /** Message that triggered the purchase */
    message?: Message;

    /** Whether the purchase was successful */
    success?: boolean;
}

/**
 * Interface for game settings
 */
export interface GameSettings {
    /** Minimum points required to play */
    minimumPoints: number;

    /** Maximum points that can be won */
    maximumWin: number;

    /** Cooldown between plays in seconds */
    cooldown: number;

    /** Whether the game is enabled */
    enabled: boolean;
}

/**
 * Interface for slot machine settings
 */
export interface SlotMachineSettings extends GameSettings {
    /** Cost to play */
    spinCost: number;

    /** Winning combinations and their payouts */
    winningCombinations: {
        [key: string]: number;
    };
} 