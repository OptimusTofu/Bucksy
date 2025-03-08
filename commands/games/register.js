const DatabaseController = require("../../controllers/database");

module.exports = {
  name: "register",
  description: "Register for the games system to get points and play games",
  usage: "",
  guildOnly: true,
  execute(msg) {
    DatabaseController.userExists(msg.member.user.id)
      .then(function (result) {
        if (result) {
          return msg.reply(
            'You are already registered to the points registry. Try "!balance" or play a game.'
          );
        }

        DatabaseController.addUser(msg.member.user.id)
          .then(() => {
            msg.reply("Welcome to the game registry!");
          })
          .catch(console.dir);
      })
      .catch(console.dir);
  },
};
