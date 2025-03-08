const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "unwant",
  description: "Remove a desired pokemon role from your profile.",
  usage: "<pokemon_name>",
  guildOnly: true,
  args: true,
  execute(msg, args) {
    const pokemonName = args[0].toLowerCase();
    const pokemon = msg.guild.roles.cache.find(
      (role) => role.name === pokemonName
    );
    const user = msg.member;
    let pokemonMsg;

    if (pokemonName === "") return;

    if (pokemon) {
      if (msg.member.roles.cache.some((role) => pokemonName === role.name)) {
        user.roles.remove(pokemon).catch(console.error);
        pokemonMsg = new MessageEmbed()
          .setColor(0x7fdf37)
          .setTitle(
            `${msg.member.user.tag} You no longer have the **${pokemonName}** role.`
          );
      } else {
        pokemonMsg = new MessageEmbed()
          .setColor(0xef2d19)
          .setTitle(
            `${msg.member.user.tag} You do not have the **${pokemonName}** role assigned.`
          );
      }
    } else {
      pokemonMsg = new MessageEmbed()
        .setColor(0xef2d19)
        .setTitle(`${msg.member.user.tag} That role is not self-assignable.`);
    }

    msg.channel.send(pokemonMsg);
  },
};
