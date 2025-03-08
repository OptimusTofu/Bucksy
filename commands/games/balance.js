const DatabaseController = require("../../controllers/database");
const config = require("../../config.json");

module.exports = {
  name: "balance",
  description: "Fetch a user's game points balance.",
  aliases: ["bal"],
  guildOnly: true,
  usage: "",
  execute(msg) {
    const user_id = msg.member.user.id;

    DatabaseController.userExists(user_id).then(function (result) {
      if (!result) {
        return msg.reply(
          'You need to register to the points registry first. Please type "!register"'
        );
      }

      DatabaseController.getBalance(user_id)
        .then((balance) => {
          msg.reply(`You currently have ${balance} ${config.emojis.pokecoin}`);
        })
        .catch((err) => {
          console.error(err);
        });
    });
  },
};
