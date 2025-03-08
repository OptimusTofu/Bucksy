import { GuildMember } from 'discord.js';
import { BotEvent, BucksyClient } from '../types';
import * as greetingController from '../controllers/greeting';

const event: BotEvent<'guildMemberAdd'> = {
    name: 'guildMemberAdd',
    once: false,
    execute(member: GuildMember) {
        const client = member.client as BucksyClient;
        greetingController.sayHello(member, client);
        console.info(`Sending a warm greeting to new user: ${member.user.tag}`);
    },
};

export default event; 