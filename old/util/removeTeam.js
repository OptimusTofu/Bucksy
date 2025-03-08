const { teams } = require("../config.json");

const removeTeam = function (msg) {
  const user = msg.member;

  // testing loop to remove teams from array...
  teams.forEach((team) => {
    user.roles.cache.find((role) => {
      if (team === role.name) {
        user.roles.remove(role).catch(console.error);
      }
    });
  });
};

module.exports = {
  removeTeam,
};
