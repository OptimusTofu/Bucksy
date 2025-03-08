const DatabaseController = require("../../controllers/database");

module.exports = {
  name: "shinies",
  description: "Gets a list of all pokemon that Bucksy knows can be shiny.",
  usage: "",
  modOnly: true,
  guildOnly: false,
  args: false,
  execute(msg) {
    DatabaseController.getShinies().then((data) => {
        msg.reply('The following list are which pokemon I know can be shiny: ``` '+data+' ``` ');
    }).catch((err) => {
        console.error(err);
    });
  },
};
