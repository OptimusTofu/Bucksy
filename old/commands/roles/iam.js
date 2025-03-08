const { MessageEmbed } = require("discord.js");
const { modRoles, teams } = require("../../config.json");
const { removeTeam } = require("../../util/removeTeam.js");

module.exports = {
  name: "iam",
  description: "Set a role for your user profile.",
  aliases: ["location", "team", "role"],
  usage: "<role>",
  guildOnly: true,
  args: true,
  execute(msg, args) {
    const roleName = args[0].toLowerCase();
    const existingRole = msg.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    const user = msg.member;
    const isModRole = modRoles.indexOf(roleName) > -1 ? true : false;

    let roleMsg;

    if (roleName === "") return;

    if (isModRole) {
      roleMsg = new MessageEmbed()
        .setColor(0xef2d19)
        .setTitle(`I'm sorry, ${user.user.tag}. I'm afraid I can't do that.`);
      
      msg.channel.send(roleMsg);
      return;
    }

    if (existingRole) {
      if (user.roles.cache.some((role) => role.name === roleName)) {
        roleMsg = new MessageEmbed()
          .setColor(0xef2d19)
          .setTitle(
            `${user.user.tag} You already have the **${roleName}** role.`
          );
      } else {
        if (teams.includes(roleName)) {
          removeTeam(msg);
        }

        user.roles.add(existingRole).catch(console.error);
        roleMsg = new MessageEmbed()
          .setColor(0x7fdf37)
          .setTitle(
            `${user.user.tag} You now have the **${roleName}** role.`
          );
      }
    } else {
      roleMsg = new MessageEmbed()
        .setColor(0xef2d19)
        .setTitle(`${user.user.tag} That role is not self-assignable.`);
    }

    msg.channel.send(roleMsg);
  },
};
