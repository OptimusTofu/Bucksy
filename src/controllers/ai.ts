import { Message, TextChannel } from 'discord.js';
import * as config from '../../config.json';
import axios from 'axios';

// Store conversation history
const conversationHistory: Map<string, Array<{ role: string, content: string }>> = new Map();

// Maximum conversation history length
const MAX_HISTORY_LENGTH = 10;

/**
 * Listens for messages in the AI channel and responds with AI-generated content
 * @param msg The message to process
 */
export const listen = async (msg: Message): Promise<void> => {
    try {
        if (msg.author.bot) return;

        // Check if the channel is a text-based channel
        if (!msg.channel || !('send' in msg.channel)) return;

        // Get the user's message
        const userMessage = msg.content.trim();

        // Get or create conversation history for this user
        const userId = msg.author.id;
        if (!conversationHistory.has(userId)) {
            conversationHistory.set(userId, []);
        }

        const history = conversationHistory.get(userId)!;

        // Add user message to history
        history.push({ role: 'user', content: userMessage });

        // Trim history if it's too long
        if (history.length > MAX_HISTORY_LENGTH) {
            history.splice(0, history.length - MAX_HISTORY_LENGTH);
        }

        // Show typing indicator
        await msg.channel.sendTyping();

        // In a real implementation, this would call an AI service like OpenAI or Dialogflow
        // For this example, we'll use a simple response based on keywords
        let response = '';

        if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
            response = `Hello ${msg.author.username}! How can I help you today?`;
        } else if (userMessage.toLowerCase().includes('help')) {
            response = `I'm ${config.botName}, an AI assistant. I can help you with information about Pokémon, answer questions, or just chat. What would you like to know?`;
        } else if (userMessage.toLowerCase().includes('pokemon') || userMessage.toLowerCase().includes('pokémon')) {
            response = 'Pokémon is a media franchise owned by The Pokémon Company. There are currently over 900 Pokémon species in the main game series. Do you have a favorite?';
        } else if (userMessage.toLowerCase().includes('favorite')) {
            response = 'Everyone has different favorite Pokémon! Some popular ones include Pikachu, Charizard, and Eevee. What\'s yours?';
        } else if (userMessage.toLowerCase().includes('game')) {
            response = 'There are many Pokémon games, including the main series games, spin-offs like Pokémon GO, and the trading card game. Which one are you interested in?';
        } else if (userMessage.toLowerCase().includes('type')) {
            response = 'There are 18 Pokémon types: Normal, Fire, Water, Electric, Grass, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel, and Fairy. Each has strengths and weaknesses against other types.';
        } else if (userMessage.toLowerCase().includes('thank')) {
            response = 'You\'re welcome! Let me know if you need anything else.';
        } else {
            response = 'That\'s an interesting question! I\'m still learning, but I\'ll do my best to help you with Pokémon-related topics.';
        }

        // Add AI response to history
        history.push({ role: 'assistant', content: response });

        // Send the response
        await msg.reply(response);

        console.log(`AI responded to ${msg.author.tag}: ${response.substring(0, 50)}${response.length > 50 ? '...' : ''}`);
    } catch (error) {
        console.error('Error in AI controller:', error);

        // Try to send an error message
        try {
            await msg.reply('Sorry, I encountered an error while processing your request. Please try again later.');
        } catch (replyError) {
            console.error('Error sending error reply:', replyError);
        }
    }
}; 