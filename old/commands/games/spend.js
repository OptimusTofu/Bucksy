const DatabaseController = require("../../controllers/database.js");
const config = require("../../config.json");

module.exports = {
  name: "spend",
  description: "Spend a specified amount of a user's game points for a prize.",
  usage: "<points>",
  guildOnly: true,
  args: true,
  execute(msg, args) {
    const points = Number(args[0]);
    const isNumber = /^\d+$/.test(points);
    const user_id = msg.member.user.id;

    DatabaseController.userExists(user_id)
      .then(function (result) {
        if (result) {
          if (isNumber) {
            DatabaseController.getBalance(user_id)
              .then((balance) => {
                if (points > balance) {
                  msg.reply(
                    `You only have ${balance} ${config.emojis.pokecoin}, better go play more games!`
                  );
                } else {
                  DatabaseController.updateBalance(user_id, -points)
                    .then(() => {
                      DatabaseController.getBalance(user_id)
                        .then((bal) => {
                          msg.reply(
                            `You now have ${bal} ${config.emojis.pokecoin} remaining.`
                          );
                        })
                        .catch(console.dir);
                    })
                    .catch(console.dir);
                }
              })
              .catch((err) => {
                console.error(err);
              });
          } else {
            msg.reply("You must specify an amount of coins as digits only.");
          }
        } else {
          msg.reply(
            "You need to register to the points registry first. Please type `!register`"
          );
        }
      })
      .catch(console.dir);
  },
};
