const axios = require("axios");
const { MessageEmbed } = require("discord.js");
const config = require("../config.json");
const DatabaseController = require("./database.js");
const sharp = require("sharp");
const potrace = require('potrace');
const fs = require('fs');
const pokemonMax = 802;
const current_pokemon = {};
let answered = false;
let active = false;

const pokeapi_instance = axios.create({
  baseURL: "https://pokeapi.co/api/v2",
  timeout: 3000,
});

const getRandomInt = () => {
    return Math.floor(Math.random() * pokemonMax);
};

const getRandomPokemon = (bot) => {
    const randomInt = getRandomInt();
    pokeapi_instance.get(`/pokemon/${randomInt}`).then(res => {
        current_pokemon.name = res.data.name;
        current_pokemon.img = res.data.sprites.front_default;
        sendNewPokemonGuess(bot);
    });
};

const sendNewPokemonGuess = (bot) => {
    const guild = bot.guilds.cache.get(config.guildID);
    const channel = guild.channels.cache.get(config.channels.guess.id);

    axios.get(current_pokemon.img, { responseType: "arraybuffer" })
        .then(function (response) {
            const params = {
                resolution: "150",
                opaque:     "opaque",
                alphamax:   "0.2",
                curve:      "0.5",
                color:      "black",
            };

            potrace.trace(response.data, params, function(err, svg) {
                if (err) throw err;
                fs.writeFileSync(`./assets/img/wtp/${current_pokemon.name}.svg`, svg);


                sharp(`./assets/img/wtp/${current_pokemon.name}.svg`)
                    .png()
                    .toFile(`./assets/img/wtp/${current_pokemon.name}.png`)
                    .then(info => {
                        const guessEmbed = new MessageEmbed()
                            .setAuthor("Who's That Pokémon?")
                            .setColor(0x00AE86)
                            .setDescription(`Type which pokémon you think this is to get some ${config.emojis.pokecoin}.`)
                            .setThumbnail(`attachment://${current_pokemon.name}.png`);

                        answered = false;
                        active = true;

                        channel.send({embed: guessEmbed, files: [`./assets/img/wtp/${current_pokemon.name}.png`]});
                    })
                    .catch(err => { console.error(err); });
            });
        })
        .catch(err => { console.error(err); });
};

const listen = (msg, bot) => {
  if (msg.author.bot) return;
  if (answered) return;
  if (!active) return;

  if (msg.content.toLowerCase().indexOf(current_pokemon.name.toLowerCase()) >= 0) {
    DatabaseController.updateBalance(msg.member.user.id, 100).catch(console.dir);
    msg.reply("You Won! 100 Pokecoins have been added to your account.");
    answered = true;
    active = false;
    start(bot);
  } else {
    DatabaseController.updateBalance(msg.member.user.id, -1).catch(console.dir);
    msg.reply("Oops, try again");
  }
};

const start = (bot) => {
    getRandomPokemon(bot);
};

module.exports = {
    start,
    listen
};
