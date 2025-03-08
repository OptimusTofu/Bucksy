const greetingController = require("../controllers/greeting.js");

module.exports = {
  name: "guildMemberRemove",
  once: false,
  execute(member, bot) {
    greetingController.sayGoodbye(member, bot);
    console.info(`Sending a warm greeting to new user: ${member}`);
  },
};
