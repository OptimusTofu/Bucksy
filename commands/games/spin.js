const { MessageEmbed } = require("discord.js");
const DatabaseController = require("../../controllers/database.js");
const { emojis, generateRandomEmoji } = require("../../util/slotMachine.js");
const config = require("../../config.json");

module.exports = {
  name: "spin",
  description: "Spin a slot machine for rewards",
  usage: "",
  guildOnly: true,
  channel: {
    id: config.channels.slots.id,
    name: config.channels.slots.name,
  },
  execute(msg) {
    DatabaseController.userExists(msg.member.user.id)
      .then(function (result) {
        if (!result) {
          return msg.reply(
            'You need to register to the points registry first. Please type "!register"'
          );
        }

        DatabaseController.updateBalance(msg.member.user.id, -1).catch(console.dir);
      })
      .catch(console.dir);

    const first = generateRandomEmoji(emojis.length);
    const second = generateRandomEmoji(emojis.length);
    const third = generateRandomEmoji(emojis.length);

    const result = first + second + third;
    const win = first === second && second === third ? true : false;
    const icon = msg.author.displayAvatarURL();

    const slotMsg = new MessageEmbed()
      .setFooter("Try again.", icon)
      .addField("Slot Machine Results", result, true)
      .setColor(0xffa500);

    if (win) {
      let winMsg;
      let score;

      switch (first) {
        case emojis[0]:
          score = 50;
          winMsg = new MessageEmbed()
            .setFooter(
              "You Won! 50 PokeCoins have been added to your account.",
              icon
            )
            .addField(
              `Slot Machine Results ${config.emojis.pokecoin}`,
              result,
              true
            )
            .setColor(0x006600);
          break;
        case emojis[5]:
          score = 100;
          winMsg = new MessageEmbed()
            .setFooter(
              "You Won! 100 PokeCoins have been added to your account.",
              icon
            )
            .addField(
              `Slot Machine Results ${config.emojis.pokecoin}`,
              result,
              true
            )
            .setColor(0x006600);
          break;
        case emojis[9]:
          score = 500;
          winMsg = new MessageEmbed()
            .setFooter(
              "You Won! 500 PokeCoins have been added to your account.",
              icon
            )
            .addField(
              `Slot Machine Results ${config.emojis.pokecoin}`,
              result,
              true
            )
            .setColor(0x006600);
          break;
        case emojis[12]:
          score = 1000;
          winMsg = new MessageEmbed()
            .setFooter(
              "You Won! 1000 PokeCoins have been added to your account.",
              icon
            )
            .addField(
              `Slot Machine Results ${config.emojis.pokecoin}`,
              result,
              true
            )
            .setColor(0x006600);
          break;
        case emojis[14]:
          score = 5000;
          winMsg = new MessageEmbed()
            .setFooter(
              "You Won! 5000 PokeCoins have been added to your account.",
              icon
            )
            .addField(
              `Slot Machine Results ${config.emojis.pokecoin}`,
              result,
              true
            )
            .setColor(0x006600);
          break;
      }

      DatabaseController.updateBalance(msg.member.user.id, score).catch(console.dir);

      msg.channel.send(winMsg);
    } else {
      msg.channel.send(slotMsg);
    }
  },
};
