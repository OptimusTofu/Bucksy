/**
 * Array of emojis for the slot machine
 */
export const emojis = [
    "🍒", // Cherry
    "🍋", // Lemon
    "🍊", // Orange
    "🍉", // Watermelon
    "🍇", // Grapes
    "🍓", // Strawberry
    "🍍", // Pineapple
    "🍎", // Apple
    "🍏", // Green Apple
    "🍌", // Banana
    "🥝", // Kiwi
    "🥥", // Coconut
    "💎", // Diamond
    "⭐", // Star
    "🌟", // Glowing Star
];

/**
 * Generates a random emoji from the emojis array
 * @param max The maximum index to generate (exclusive)
 * @returns A random emoji
 */
export function generateRandomEmoji(max: number): string {
    return emojis[Math.floor(Math.random() * max)];
} 