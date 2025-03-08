module.exports = {
  pokemon: (msg, bot) => {
    const embed = msg.embeds[0];

    if (embed) {
      const text = embed.description;
      const pokemonName = text.split(" ")[0].toLowerCase();
      const pokemonRole = msg.guild.roles.cache.find((role) =>
        pokemonName.startsWith(role.name.toLowerCase())
      );
      const locationName = embed.title.toLowerCase();
      const locationRole = msg.guild.roles.cache.find((role) =>
        locationName.startsWith(role.name.toLowerCase())
      );

      if (pokemonRole) {
        console.debug(
          "Found matching Hoppip post to existing role. Notifying users.",
          pokemonName
        );
        msg.channel.send(`A wild ${pokemonRole} appeared in ${locationRole}`);
      }
    }
  },
};
