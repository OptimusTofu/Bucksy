const DatabaseController = require("../../controllers/database");
const config = require("../../config.json");

module.exports = {
  name: "remove",
  description: "Remove a shiny from the shinies collection",
  usage: "<pokemon>",
  modOnly: true,
  guildOnly: true,
  channel: {
    id: config.channels.admin.id,
    name: config.channels.admin.name,
  },
  execute(msg, args) {
    const pokemon = args[0].toLowerCase();

    DatabaseController.removeShiny(pokemon)
      .then((data) => {
        if (data.deletedCount === 1) {
          msg.reply(`${pokemon} is now removed from the shiny list!`);
        } else {
          msg.reply(`Oops, ${pokemon} is not registered in the shiny list.`);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  },
};
