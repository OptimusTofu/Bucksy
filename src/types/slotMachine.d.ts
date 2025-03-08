declare module '../../util/slotMachine' {
    /**
     * Array of emojis for the slot machine
     */
    export const emojis: string[];

    /**
     * Generates a random emoji from the emojis array
     * @param max The maximum index to generate (exclusive)
     * @returns A random emoji
     */
    export function generateRandomEmoji(max: number): string;
} 