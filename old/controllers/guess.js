const { MessageEmbed, MessageAttachment } = require("discord.js");
const CronJob = require("cron").CronJob;
const config = require("../config.json");
const pokemonGuesses = require("../assets/data/guesses.json");
const DatabaseController = require("./database.js");

let answer = "";
let answered = false;
let active = false;

const sendGuess = (bot) => {
  const guessMsg = config.guessMsg;
  const guild = bot.guilds.cache.get(config.guildID);
  const index = Math.floor(Math.random() * (pokemonGuesses.length - 1));
  const file = new MessageAttachment(pokemonGuesses[index].path, "image.jpg");
  const guessEmbed = new MessageEmbed()
    .attachFiles(file)
    .setAuthor(guessMsg)
    .setImage("attachment://image.jpg");

  answer = pokemonGuesses[index].answer;
  answered = false;
  active = true;

  guild.channels.cache.get(config.channels.guess.id).send(guessEmbed);
};

const getAnswer = () => {
  return answer;
};

const getActive = () => {
  return active;
};

const getAnswered = () => {
  return answered;
};

const setAnswered = (bool) => {
  answered = bool;
};

const listen = (msg) => {
  if (msg.author.bot) return;
  if (getAnswered()) return;
  if (!getActive()) return;

  if (msg.content.toLowerCase().indexOf(getAnswer().toLowerCase()) >= 0) {
    DatabaseController.updateBalance(msg.member.user.id, 100).catch(console.dir);
    msg.reply("You Won! 100 Pokecoins have been added to your account.");
    setAnswered(true);
  } else {
    DatabaseController.updateBalance(msg.member.user.id, -1).catch(console.dir);
    msg.reply("Oops, try again");
  }
};

const start = (bot) => {
  const job = new CronJob(
    config.guessTime,
    function () {
      sendGuess(bot);
    },
    null,
    true,
    "America/New_York"
  );

  job.start();
};

module.exports = {
  start,
  getAnswer,
  getAnswered,
  setAnswered,
  listen,
};
