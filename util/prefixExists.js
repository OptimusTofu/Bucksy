const { prefix } = require("../config.json");

const prefixExists = (msg) => {
  let exists = false;

  prefix.forEach((char) => {
    if (msg) {
      if (msg.content.startsWith(char)) {
        exists = true;
      }
    }
  });
  return exists;
};

module.exports = {
  prefixExists,
};
