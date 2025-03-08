const config = require("../../config.json");
const QotdController = require("../../controllers/qotd");

module.exports = {
  name: "ask",
  description: "Get a popular question of the day from Reddit",
  aliases: ["qotd"],
  usage: "",
  modOnly: true,
  guildOnly: true,
  channel: {
    id: config.channels.qotd.id,
    name: config.channels.qotd.name,
  },
  execute(msg, bot) {
    try {
      console.log(bot);
      QotdController.ask(msg, bot);
    } catch (error) {
      console.error(error);
    }
  },
};
