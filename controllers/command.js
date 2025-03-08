const { Collection } = require("discord.js");

const listen = (msg, bot) => {
  const args = msg.content.trim().split(/ +/);
  const commandName = args.shift().slice(1).toLowerCase();
  const command =
    bot.commands.get(commandName) ||
    bot.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (commandName && !command)
    return msg.reply(
      "I don't currently support this command. Try !help to get a list of commands I support."
    );

  if (command.guildOnly && msg.channel.type === "dm") {
    return msg.reply("I can't execute that command inside DMs!");
  }

  if (
    command.modOnly &&
    !msg.member.roles.cache.some((r) => bot.config.modRoles.includes(r.name))
  ) {
    return msg.reply(
      "I can't execute that command for you, ask a moderator for help."
    );
  }

  if (command.channel && msg.channel.id !== command.channel.id) {
    return msg.reply(
      `I can only enter that command in <#${command.channel.id}>.`
    );
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${msg.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`!${command.name} ${command.usage}\``;
    }

    return msg.channel.send(reply);
  }

  if (!bot.cooldowns.has(command.name)) {
    bot.cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = bot.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(msg.author.id)) {
    const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return msg.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }

  timestamps.set(msg.author.id, now);
  setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);

  try {
    command.execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply("Oops! I am having trouble executing that command.");
  }
};

module.exports = {
  listen,
};
