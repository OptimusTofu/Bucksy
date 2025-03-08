import { Message, Client } from 'discord.js';
import { BotEvent, BucksyClient } from '../types';
import * as aiController from '../controllers/ai';
import * as commandController from '../controllers/command';
import * as wtpController from '../controllers/wtp';
import * as notifyController from '../controllers/notify';
// import * as triviaController from '../controllers/trivia';
// import * as ocrController from '../controllers/ocr';
import { prefixExists } from '../util/prefixExists';
// import { isImage } from '../util/isImage';

const event: BotEvent<'messageCreate'> = {
  name: 'messageCreate',
  once: false,
  execute(msg: Message) {
    const client = msg.client as BucksyClient;

    if (prefixExists(msg, client) && msg.channel.id !== client.config.channels.pvp.id) {
      commandController.listen(msg, client);
    } else if (
      msg.author.bot &&
      msg.channel.id === client.config.channels.rares.id
    ) {
      notifyController.pokemon(msg, client);
    } else if (msg.channel.id === client.config.channels.ai.id) {
      aiController.listen(msg);
    } else if (msg.channel.id === client.config.channels.guess.id) {
      wtpController.listen(msg, client);
      // eslint-disable-next-line no-inline-comments
    } /* else if (msg.channel.id === client.config.channels.trivia.id) {
      triviaController.listen(msg);
    } else if (msg.channel.id === client.config.channels.count.id) {
      if (msg.attachments.size > 0 && msg.attachments.every(isImage)) {
        ocrController.readPokemonCountImageText(
          msg,
          msg.attachments.array()[0]
        );
      }
    }*/
  },
};

export default event; 