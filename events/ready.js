const guessController = require("../controllers/guess.js");
const qotdController = require("../controllers/qotd.js");
// const triviaController = require("../controllers/trivia.js");

module.exports = {
  name: "ready",
  once: true,
  execute(bot) {
    qotdController.start(bot);
    guessController.start(bot);
    // triviaController.start(bot);
    console.debug(`Logged in as ${bot.user.tag} - ${bot.user.username}!`);
  },
};
