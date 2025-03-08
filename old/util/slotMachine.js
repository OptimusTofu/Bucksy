const config = require("../config.json");

const emojis = [
  config.emojis.nanab,
  config.emojis.nanab,
  config.emojis.nanab,
  config.emojis.nanab,
  config.emojis.nanab,
  config.emojis.pinap,
  config.emojis.pinap,
  config.emojis.pinap,
  config.emojis.pinap,
  config.emojis.razz,
  config.emojis.razz,
  config.emojis.razz,
  config.emojis.silver_pinap,
  config.emojis.silver_pinap,
  config.emojis.golden_razz,
];

const generateRandomEmoji = (max) => emojis[Math.floor(Math.random() * max)];

module.exports = {
  emojis,
  generateRandomEmoji,
};
