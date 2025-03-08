import { BotEvent, BucksyClient } from '../types';
import * as qotdController from '../controllers/qotd';
import { Client } from 'discord.js';
import * as wtpController from '../controllers/wtp';
// import * as triviaController from '../controllers/trivia';

const event: BotEvent<'ready'> = {
    name: 'ready',
    once: true,
    execute(client: Client<true>) {
        qotdController.start(client as BucksyClient);
        wtpController.start(client as BucksyClient);
        // triviaController.start(client);
        console.log(`Logged in as ${client.user?.tag} - ${client.user?.username}!`);
    },
};

export default event; 