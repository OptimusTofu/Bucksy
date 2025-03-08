const DatabaseController = require("../../controllers/database.js");
const config = require("../../config.json");

module.exports = {
  name: "pay",
  description: "Pay a specified amount of coins to a user",
  modOnly: true,
  guildOnly: true,
  usage: "",
  execute(msg, args) {
    const user_id = msg.mentions.users.first().id;
    const tag = msg.mentions.users.first().tag;
    const points = args[1];
    const isNumber = /^\d+$/.test(points);

    DatabaseController.userExists(user_id)
      .then(function (exists) {
        if (exists) {
          if (isNumber) {
            DatabaseController.updateBalance(user_id, -points)
              .then(() => {
                DatabaseController.getBalance(user_id)
                  .then((balance) => {
                    msg.reply(
                      `${tag}, You now have ${balance} ${config.emojis.pokecoin}.`
                    );
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              })
              .catch((err) => {
                console.error(err);
              });
          } else {
            msg.reply("You must specify an amount of coins as digits only.");
          }
        } else {
          msg.reply(
            `${tag} needs to register to the points registry first. Please have them type \`!register\``
          );
        }
      })
      .catch(console.dir);
  },
};
