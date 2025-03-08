const config = require("../config.json");

const sayHello = function (member, bot) {
  const guild = member.guild;
  guild.channels.cache
    .find((channel) => channel.name === "pokenavigate-yourself")
    .send(
      `Hey ${member.user} welcome to the server! Assign your team here and the rest of the server/channels will open up for you! We are happy to have you! ☺️`
    )
    .then(function (msg) {
      msg
        .react(config.emojis.valor)
        .then(() => {
          msg.react(config.emojis.instinct);
        })
        .then(() => {
          msg.react(config.emojis.mystic);
        })
        .then(() => {
          const filter = (reaction, user) => {
            return (
              ["valor", "instinct", "mystic"].includes(reaction.emoji.name) &&
              user.id === member.user.id
            );
          };

          msg.awaitReactions(filter, { max: 1 }).then((collected) => {
            const reaction = collected.first();
            const verified = guild.roles.cache.find(
              (role) => role.name === "Verified"
            );
            if (reaction.emoji.name === "valor") {
              const valor = guild.roles.cache.find(
                (role) => role.name === "valor"
              );
              member.roles.add(valor).catch(console.error);
              member.roles.add(verified).catch(console.error);
              msg.channel.send(
                `${member.user.tag}, you now have the valor role`
              );
            } else if (reaction.emoji.name === "instinct") {
              const instinct = guild.roles.cache.find(
                (role) => role.name === "instinct"
              );
              member.roles.add(instinct).catch(console.error);
              member.roles.add(verified).catch(console.error);
              msg.channel.send(
                `${member.user.tag}, you now have the instinct role`
              );
            } else if (reaction.emoji.name === "mystic") {
              const mystic = guild.roles.cache.find(
                (role) => role.name === "mystic"
              );
              member.roles.add(mystic).catch(console.error);
              member.roles.add(verified).catch(console.error);
              msg.channel.send(
                `${member.user.tag}, you now have the mystic role`
              );
            } else {
              msg.channel.send(
                `${member.user.tag}, you reacted with something else entirely.`
              );
            }
          });
        });
    })
    .catch(function (e) {
      console.error("Something went wrong.", e);
    });
};

const sayGoodbye = function (member, bot) {
  const guild = member.guild;
  guild.channels.cache
    .find((channel) => channel.name === "felicia")
    .send(`User, ${member.user.tag}, has left the building.`)
    .then(function (msg) {
      msg.react("👎");
    })
    .catch(function () {
      console.error("Something went wrong.");
    });
};

module.exports = {
  sayHello,
  sayGoodbye,
};
