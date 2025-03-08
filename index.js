const { Client, Collection } = require("discord.js");
const fs = require("fs");
const commands = fs.readdirSync("./commands");
const events = fs.readdirSync("./events").filter((file) => file.endsWith(".js"));
const dotenv = require("dotenv");
const config = require("./config.json");
const bot = new Client();

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

bot.login(process.env.TOKEN);

exports.bot = bot;
