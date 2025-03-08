const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "iamnot",
  description: "Remove a role from your user profile.",
  aliases: ["iamn"],
  usage: "<role>",
  guildOnly: true,
  args: true,
  execute(msg, args) {
    const roleName = args[0].toLowerCase();
    const existingRole = msg.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    const member = msg.member;
    let roleMsg;

    if (roleName === "") return;

    if (existingRole) {
      if (member.roles.cache.some((role) => role.name === roleName)) {
        member.roles.remove(existingRole).catch(console.dir);
        roleMsg = new MessageEmbed()
          .setColor(0x7fdf37)
          .setTitle(
            `${member.user.tag} You no longer have the **${roleName}** role.`
          );
      } else {
        roleMsg = new MessageEmbed()
          .setColor(0xef2d19)
          .setTitle(
            `${member.user.tag} You do not have the **${roleName}** role assigned.`
          );
      }
    } else {
      roleMsg = new MessageEmbed()
        .setColor(0xef2d19)
        .setTitle(`${member.user.tag} That role is not self-assignable.`);
    }

    msg.channel.send(roleMsg);
  },
};
