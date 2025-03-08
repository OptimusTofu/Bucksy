const aiController = require("../controllers/ai.js");
const commandController = require("../controllers/command.js");
const wtpController = require("../controllers/wtp.js");
const notifyController = require("../controllers/notify.js");
// const triviaController = require("../controllers/trivia.js");
// const ocrController = require("../controllers/ocr.js");
const { prefixExists } = require("../util/prefixExists.js");
// const { isImage } = require("../util/isImage.js");

module.exports = {
  name: "message",
  once: false,
  execute(msg, bot) {
    if (prefixExists(msg, bot) && msg.channel.id !== bot.config.channels.pvp.id) {
      commandController.listen(msg, bot);
    } else if (
      msg.author.bot &&
      msg.channel.id === bot.config.channels.rares.id
    ) {
      notifyController.pokemon(msg, bot);
    } else if (msg.channel.id === bot.config.channels.ai.id) {
      aiController.listen(msg);
    } else if (msg.channel.id === bot.config.channels.guess.id) {
      wtpController.listen(msg, bot);
    // eslint-disable-next-line no-inline-comments
    } /* else if (msg.channel.id === bot.config.channels.trivia.id) {
      triviaController.listen(msg);
    }  else if (msg.channel.id === bot.config.channels.count.id) {
      if (msg.attachments.size > 0 && msg.attachments.every(isImage)) {
        ocrController.readPokemonCountImageText(
          msg,
          msg.attachments.array()[0]
        );
      }
    }*/
  },
};
