import { Message, TextChannel, EmbedBuilder } from 'discord.js';
import { BucksyClient } from '../types';
import * as config from '../../config.json';

// List of rare Pokemon to notify about
const rarePokemon = [
    'mewtwo', 'mew', 'articuno', 'zapdos', 'moltres',
    'raikou', 'entei', 'suicune', 'lugia', 'ho-oh', 'celebi',
    'regirock', 'regice', 'registeel', 'latias', 'latios', 'kyogre', 'groudon', 'rayquaza', 'jirachi', 'deoxys',
    'uxie', 'mesprit', 'azelf', 'dialga', 'palkia', 'heatran', 'regigigas', 'giratina', 'cresselia', 'phione', 'manaphy', 'darkrai', 'shaymin', 'arceus',
    'victini', 'cobalion', 'terrakion', 'virizion', 'tornadus', 'thundurus', 'reshiram', 'zekrom', 'landorus', 'kyurem', 'keldeo', 'meloetta', 'genesect',
    'xerneas', 'yveltal', 'zygarde', 'diancie', 'hoopa', 'volcanion',
    'type: null', 'silvally', 'tapu koko', 'tapu lele', 'tapu bulu', 'tapu fini', 'cosmog', 'cosmoem', 'solgaleo', 'lunala', 'nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela', 'kartana', 'guzzlord', 'necrozma', 'magearna', 'marshadow', 'poipole', 'naganadel', 'stakataka', 'blacephalon', 'zeraora',
    'meltan', 'melmetal',
    'zacian', 'zamazenta', 'eternatus', 'kubfu', 'urshifu', 'zarude', 'regieleki', 'regidrago', 'glastrier', 'spectrier', 'calyrex',
    'shiny'
];

/**
 * Processes Pokemon notifications from other bots
 * @param msg The message to process
 * @param client The bot client
 */
export const pokemon = async (msg: Message, client: BucksyClient): Promise<void> => {
    try {
        if (!msg.author.bot) return;

        // Check if the channel is a text-based channel
        if (!msg.channel || !('send' in msg.channel)) return;

        // Get the content of the message
        const content = msg.content.toLowerCase();

        // Check if the message contains any rare Pokemon
        const foundRare = rarePokemon.find(pokemon => content.includes(pokemon.toLowerCase()));

        if (!foundRare) return;

        // Get the rare Pokemon channel
        const guild = msg.guild;
        if (!guild) return;

        const rareChannel = guild.channels.cache.get(config.channels.rares.id);
        if (!rareChannel || !rareChannel.isTextBased()) {
            console.error('Rare Pokemon channel not found or not a text channel');
            return;
        }

        // Create an embed for the notification
        const notifyEmbed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle('Rare Pokemon Alert!')
            .setDescription(`A rare Pokemon has been spotted: **${foundRare.toUpperCase()}**!`)
            .addFields(
                { name: 'Original Message', value: msg.content.length > 1024 ? msg.content.substring(0, 1021) + '...' : msg.content },
                { name: 'Channel', value: `<#${msg.channel.id}>`, inline: true },
                { name: 'Posted By', value: msg.author.tag, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Go catch it!', iconURL: client.user?.displayAvatarURL() });

        // Add the image if there is one
        if (msg.attachments.size > 0) {
            const attachment = msg.attachments.first();
            if (attachment && attachment.contentType?.startsWith('image/')) {
                notifyEmbed.setImage(attachment.url);
            }
        }

        // Send the notification
        await (rareChannel as TextChannel).send({
            content: '@everyone A rare Pokemon has been spotted!',
            embeds: [notifyEmbed]
        });

        console.log(`Sent rare Pokemon notification for ${foundRare}`);
    } catch (error) {
        console.error('Error in Pokemon notification controller:', error);
    }
}; 