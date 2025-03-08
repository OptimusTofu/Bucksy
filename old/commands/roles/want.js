const { MessageEmbed } = require("discord.js");
const { modRoles } = require("../../config.json");

module.exports = {
  name: "want",
  description: "Set a desired pokemon for your profile.",
  usage: "<pokemon_name>",
  guildOnly: true,
  args: true,
  execute(msg, args) {
    const pokemonName = args[0].toLowerCase();
    const pokemon = msg.guild.roles.cache.find(
      (role) => role.name === pokemonName
    );
    const user = msg.member;
    const isModRole = modRoles.indexOf(pokemonName) > -1 ? true : false;

    let pokemonMsg;

    if (pokemonName === "") return;

    if (isModRole) {
      pokemonMsg = new MessageEmbed()
        .setColor(0xef2d19)
        .setTitle(`I'm sorry, ${user.user.tag}. I'm afraid I can't do that.`);
      
      msg.channel.send(pokemonMsg);
      return;
    }

    if (pokemon) {
      if (user.roles.cache.some((role) => role.name === pokemonName)) {
        pokemonMsg = new MessageEmbed()
          .setColor(0x7fdf37)
          .setTitle(
            `${user.user.tag} You already have the **${pokemonName}** role.`
          );

        msg.channel.send(pokemonMsg);
      } else {
        user.roles.add(pokemon).catch(console.error);
        pokemonMsg = new MessageEmbed()
          .setColor(0x7fdf37)
          .setTitle(
            `${user.user.tag} You now have the **${pokemonName}** role.`
          );

        msg.channel.send(pokemonMsg);
      }
    } else {

      // Create a new role with data
      msg.guild.roles
        .create({
          data: {
            name: pokemonName,
            color: "BLUE",
            mentionable: true,
          },
        })
        .then((role) => {
          user.roles.add(role).catch(console.error);

          pokemonMsg = new MessageEmbed()
            .setColor(0x7fdf37)
            .setTitle(
              `${msg.member.user.tag} You now have the **${pokemonName}** role.`
            );

          msg.channel.send(pokemonMsg);
        })
        .catch(err => {
          console.log(err);
        });
    }
  },
};
