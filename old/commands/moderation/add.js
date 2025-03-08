const config = require("../../config.json");
const DatabaseController = require("../../controllers/database");

module.exports = {
  name: "add",
  description: "Add a shiny to the shinies collection",
  usage: "<pokemon>",
  modOnly: true,
  guildOnly: true,
  args: true,
  channel: {
    id: config.channels.admin.id,
    name: config.channels.admin.name,
  },
  execute(msg, args) {
    const pokemon = args[0].toLowerCase();

    DatabaseController.shinyExists(pokemon)
      .then((exists) => {
        if (exists) {
          return msg.reply(
            `Oops, ${pokemon} is already registered to the shiny list!`
          );
        }

        DatabaseController.addShiny(pokemon)
          .then((data) => {
            if (data.insertedCount === 1) {
              msg.reply(`${pokemon} is now registered to the shiny list!`);
            }
          })
          .catch(console.dir);
      })
      .catch((err) => {
        console.error(err);
      });
  },
};
