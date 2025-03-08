const config = require("../../config.json");
const process = require('process');

module.exports = {
  name: "uptime",
  description: "Tells how long Bucksy has been running.",
  usage: "",
  modOnly: true,
  guildOnly: true,
  args: false,
  channel: {
    id: config.channels.admin.id,
    name: config.channels.admin.name,
  },
  execute(msg) {
      function formatUptime (time) {
        const d = Math.floor(time / (3600*24));
        const h = Math.floor(time % (3600*24) / 3600);
        const m = Math.floor(time % 3600 / 60);
        const s = Math.floor(time % 60);
        const days = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
        const hours = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        const minutes = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        const seconds = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";

        return days + hours + minutes + seconds;
      };
      
      msg.reply(`${config.botName} has been running for ${formatUptime(process.uptime())}`);
  },
};
