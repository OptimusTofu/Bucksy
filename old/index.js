const { Client, Collection } = require("discord.js");
const fs = require("fs");
const commands = fs.readdirSync("./commands");
const events = fs.readdirSync("./events").filter((file) => file.endsWith(".js"));
const dotenv = require("dotenv");
const config = require("./config.json");
const DatabaseController = require("./controllers/database");
const bot = new Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
    "GUILD_MESSAGE_REACTIONS"
  ]
});

dotenv.config();

bot.config = config;
bot.commands = new Collection();
bot.cooldowns = new Collection();

for (const folder of commands) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    bot.commands.set(command.name, command);
  }
}

for (const file of events) {
  const event = require(`./events/${file}`);

  if (event.once) {
    bot.once(event.name, (...args) => event.execute(...args, bot));
  } else {
    bot.on(event.name, (...args) => event.execute(...args, bot));
  }
}

async function startBot() {
  try {
    const dbInitialized = await DatabaseController.initializeDB();
    if (!dbInitialized) {
      console.error("Failed to initialize database. Exiting...");
      process.exit(1);
    }

    await bot.login(process.env.TOKEN);
    console.log(`${bot.user.username} is online!`);
  } catch (error) {
    console.error("Error starting the bot:", error);
    process.exit(1);
  }
}

startBot();

exports.bot = bot;
