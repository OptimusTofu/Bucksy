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
  async execute(msg) {
    try {
      // Check if user exists in the database
      const userRegistered = await DatabaseController.userExists(msg.member.user.id);
      if (!userRegistered) {
        return msg.reply(
          'You need to register to the points registry first. Please type "!register"'
        );
      }

      // Deduct 1 point for spinning
      const balanceUpdated = await DatabaseController.updateBalance(msg.member.user.id, -1);
      if (!balanceUpdated) {
        return msg.reply("There was an error updating your balance. Please try again later.");
      }

      // Generate random emojis for the slot machine
      const first = generateRandomEmoji(emojis.length);
      const second = generateRandomEmoji(emojis.length);
      const third = generateRandomEmoji(emojis.length);

      const result = first + second + third;
      const win = first === second && second === third;
      const icon = msg.author.displayAvatarURL();

      // If user didn't win, send a message and return
      if (!win) {
        const slotMsg = new MessageEmbed()
          .setFooter("Try again.", icon)
          .addField("Slot Machine Results", result, true)
          .setColor(0xffa500);

        return msg.channel.send(slotMsg);
      }

      // Handle win scenario
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
        default:
          score = 10;
          winMsg = new MessageEmbed()
            .setFooter(
              "You Won! 10 PokeCoins have been added to your account.",
              icon
            )
            .addField(
              `Slot Machine Results ${config.emojis.pokecoin}`,
              result,
              true
            )
            .setColor(0x006600);
      }

      // Update user's balance with winnings
      await DatabaseController.updateBalance(msg.member.user.id, score);

      // Send win message
      return msg.channel.send(winMsg);
    } catch (error) {
      console.error("Error in spin command:", error);
      return msg.reply("An error occurred while processing your spin. Please try again later.");
    }
  },
};
