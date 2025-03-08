import { GuildMember, PartialGuildMember } from 'discord.js';
import { BotEvent, BucksyClient } from '../types';
import * as greetingController from '../controllers/greeting';

const event: BotEvent<'guildMemberRemove'> = {
    name: 'guildMemberRemove',
    once: false,
    execute(member: GuildMember | PartialGuildMember) {
        // If the member is partial, we can't do much with it
        if (member.partial) {
            console.log(`A member left the server, but we only have partial data.`);
            return;
        }

        const client = member.client as BucksyClient;
        greetingController.sayGoodbye(member as GuildMember, client);
        console.info(`Saying goodbye to departing user: ${member.user?.tag || 'Unknown User'}`);
    },
};

export default event; 