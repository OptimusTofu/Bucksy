/**
 * Interface for channel configuration
 */
export interface Channel {
    id: string;
    name: string;
}

/**
 * Interface for bot configuration
 */
export interface Config {
    /** Command prefixes */
    prefix: string[];

    /** MongoDB connection URL */
    mongoDBURL: string;

    /** MongoDB database name */
    mongoDBName: string;

    /** Bot name */
    botName: string;

    /** AI ID for dialogflow */
    aiID: string;

    /** Discord guild ID */
    guildID: string;

    /** Cron schedule for Question of the Day */
    qotdTime: string;

    /** URL for Question of the Day */
    qotdURL: string;

    /** Message for guess game */
    guessMsg: string;

    /** Cron schedule for guess game */
    guessTime: string;

    /** Starting points for new users */
    startingPoints: number;

    /** Whether to use verified role */
    verifiedRole: boolean;

    /** Moderator role names */
    modRoles: string[];

    /** Team names */
    teams: string[];

    /** Channel configurations */
    channels: {
        admin: Channel;
        rares: Channel;
        qotd: Channel;
        slots: Channel;
        guess: Channel;
        ai: Channel;
        count: Channel;
        pvp: Channel;
        [key: string]: Channel;
    };

    /** Hoppip bot configuration */
    hoppip: {
        name: string;
        id: string[];
    };

    /** Emoji configurations */
    emojis: {
        nanab: string;
        pinap: string;
        razz: string;
        silver_pinap: string;
        golden_razz: string;
        pokecoin: string;
        instinct: string;
        mystic: string;
        valor: string;
        [key: string]: string;
    };
} 