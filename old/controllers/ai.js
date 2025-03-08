/* eslint-disable no-case-declarations */
"use strict";

const axios = require("axios");
const database = require("./database.js");
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const dotenv = require("dotenv");
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const axios_instance = axios.create({
  baseURL: "https://pokeapi.co/api/v2",
  timeout: 3000,
});

const think = async (msg) => {
  if (msg.author.bot) return;
  const text = msg.content;
  const projectId = process.env.DIALOGFLOW_PROJECT_ID;
  const sessionId = uuid.v4();
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: text,
        languageCode: 'en-US',
      },
    },
  };
  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;
  const pokemon_endpoint = ["abilities", "moves", "photo", "type", "shiny"];
  const pokemon_species_endpoint = ["description", "evolution", "about"];
  const pokemon = result.parameters && typeof(result.parameters.fields.pokemon) !== 'undefined' ? result.parameters.fields.pokemon.stringValue
    .toLowerCase()
    .replace(".", "-")
    .replace(" ", "")
    .replace("'", "") : '';
  const specs = result.parameters && typeof(result.parameters.fields.specs) !== 'undefined' ? result.parameters.fields.specs.listValue.values : '';
  const evolution = result.parameters && typeof(result.parameters.fields.evolutions) !== 'undefined' ? result.parameters.fields.evolutions.listValue.values : '';
  const get_type_effectiveness = result.parameters && typeof(result.parameters.fields.type_effectiveness) !== 'undefined' ? true : false;
  const get_joke_intent = result.parameters && typeof(result.parameters.fields.Joke) !== 'undefined' ? true : false;
  const response_obj = {};

  if (specs) {
    for (const spec of specs) {
      if (pokemon_endpoint.indexOf(spec.stringValue) !== -1) {
        let fulfillmentText;
        const { data } = await axios_instance.get(`/pokemon/${pokemon}`);
        const id = String(data.id).padStart(3, "0");
        console.log('matching for spec:', spec);
        switch (spec.stringValue) {
          case "type":
            const types = data.types.map((item) => item.type.name).join(", ");
            fulfillmentText = `${pokemon} is typed as: ${types}`;
            Object.assign(response_obj, { fulfillmentText });
            break;
          case "photo":
            Object.assign(response_obj, {
              fulfillmentText: pokemon,
              payload: {
                is_image: true,
                url: `https://www.pkparaiso.com/imagenes/xy/sprites/global_link/${id}.png`,
              },
            });
            break;
          case "shiny":
            await database.shinyExists(pokemon.toLowerCase()).then(function (is_shiny) {
              if (is_shiny) {
                fulfillmentText = `Yes, ${pokemon} is available as a shiny.`;
              } else {
                fulfillmentText = `No, ${pokemon} is not available as a shiny at this time.`;
              }
              Object.assign(response_obj, { fulfillmentText });
            })
            .catch(console.error);
            break;
          default:
            const value = spec.stringValue == "abilities"
                ? data.abilities.map((item) => item.ability.name).join(", ")
                : data.moves.map((item) => item.move.name).join(", ");

            fulfillmentText = `The ${specs} of ${pokemon} are: ${value}`;
            Object.assign(response_obj, { fulfillmentText });
            break;
        }
      }

      if (pokemon_species_endpoint.indexOf(spec.stringValue) !== -1) {
        const { data } = await axios_instance.get(`/pokemon-species/${pokemon}`);
        const responseText = data.flavor_text_entries.find((item) => { return item.language.name == "en"; });
        let fulfillmentText;
        if (spec.stringValue == "description") {
          fulfillmentText = `${pokemon}:\n\n ${responseText.flavor_text}`;
          Object.assign(response_obj, {
            fulfillmentText,
          });
        }
      }
    }
  }

  if (evolution) {
    const { data } = await axios_instance.get(`/pokemon-species/${pokemon}`);
    const evolution_chain_id = data.evolution_chain.url.split("/")[6];
    const evolution_response = await axios_instance.get(
      `/evolution-chain/${evolution_chain_id}`
    );
    const evolution_requirement = result.parameters.fields.evolutions.listValue.values;
    const pokemon_evolutions = [evolution_response.data.chain.species.name];
    let fulfillmentText = `${pokemon} has no evolution`;

    if (evolution_response.data.chain.evolves_to.length) {
      pokemon_evolutions.push(
        evolution_response.data.chain.evolves_to[0].species.name
      );
    }

    if (evolution_response.data.chain.evolves_to[0].evolves_to.length) {
      pokemon_evolutions.push(
        evolution_response.data.chain.evolves_to[0].evolves_to[0].species.name
      );
    }

    const evolution_chain = pokemon_evolutions.join(" -> ");
    const order_in_evolution_chain = pokemon_evolutions.indexOf(pokemon);
    const next_form = pokemon_evolutions[order_in_evolution_chain + 1];
    const previous_form = pokemon_evolutions[order_in_evolution_chain - 1];
    const evolution_text = {
      evolution_chain: `${pokemon}'s evolution chain is: ${evolution_chain}`,
      first_evolution:
        pokemon == pokemon_evolutions[0]
          ? "This is already the first form"
          : `${pokemon_evolutions[0]} is the first evolution`,
      last_evolution:
        pokemon == pokemon_evolutions[pokemon_evolutions.length - 1]
          ? "This is already the final form"
          : pokemon_evolutions[pokemon_evolutions.length - 1],
      next_form: `${pokemon} evolves to ${next_form}`,
      previous_form: `${pokemon} evolves from ${previous_form}`,
    };

    if (evolution_text[evolution_requirement]) {
      fulfillmentText = evolution_text[evolution_requirement];
    } else {
      fulfillmentText = evolution_text.evolution_chain;
    }

    Object.assign(response_obj, {
      fulfillmentText,
    });
  }

  if (get_type_effectiveness) {
    const pokemon_type = result.parameters.fields.pokemon_types.stringValue;
    let type_effectiveness = result.parameters.fields.type_effectiveness.listValue.values[0].stringValue;
    if (typeof type_effectiveness !== "undefined") {
      let type_effectiveness_formatted = type_effectiveness.replace(
        /_/g,
        " "
      );
      const type_effectiveness_word = result.outputContexts[0].parameters.fields["type_effectiveness.original"].listValue.values;
      const pokemon_type_comes_first = result.queryText.indexOf(pokemon_type) < result.queryText.indexOf(type_effectiveness_word) ?
        true :
        false;
      const exempt_words = [
        "resistant",
        "no damage",
        "zero damage",
        "no effect",
      ];

      let from_or_to = type_effectiveness.split("_")[2];
      const has_exempt_words = exempt_words.some((v) =>
        type_effectiveness_word.includes(v)
      );

      if ((pokemon_type_comes_first && !has_exempt_words) || (!pokemon_type_comes_first && has_exempt_words)) {
        const new_from_or_to = from_or_to === "from" ? "from" : "to";
        type_effectiveness = type_effectiveness.replace(
          from_or_to,
          new_from_or_to
        );
        from_or_to = new_from_or_to;
      }

      const output = await axios_instance.get(`/type/${pokemon_type}`);

      if (type_effectiveness === "effective against") {
        if (pokemon_type_comes_first) {
          type_effectiveness = "double_damage_to";
          type_effectiveness_formatted = "double_damage_to".replace(/_/g," ");
          from_or_to = "to";
        } else {
          type_effectiveness = "double_damage_from";
          type_effectiveness_formatted = "double_damage_from".replace(/_/g," ");
          from_or_to = "from";
        }
      }

      const damage_relations = output.data.damage_relations[type_effectiveness].length > 0 ? output.data.damage_relations[type_effectiveness].map((item) => item.name).join(", ") : "none";
      const nature_of_damage = from_or_to === "from" ? "receives" : "inflicts";
      const fulfillmentText = nature_of_damage === "inflicts" ?
        `${pokemon_type} type inflicts ${type_effectiveness_formatted} ${damage_relations} type` :
        `${pokemon_type} ${nature_of_damage} ${type_effectiveness_formatted} the following: ${damage_relations}`;

      Object.assign(response_obj, {
        fulfillmentText,
      });
    }
  }

  if (get_joke_intent) {
    axios.get("https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit").then((response) => {
        let joke = response.data;

        if (joke.type === 'twopart') {
          msg.channel.send(joke.setup).then(() => {
            setTimeout(() => {
              msg.channel.send(joke.delivery);
            }, 3000);
          });
        } else {
          msg.channel.send(joke.joke);
        }
    });
    return;
  }


  const response = new Object();
  response.response_obj = response_obj;
  response.msg = msg;
  response.pokemon = pokemon;
  response.result = result;

  return response;
};

const speak = (data) => {
  if (data.response_obj.fulfillmentText && !data.response_obj.payload) {
    data.msg.channel.send(data.response_obj.fulfillmentText);
  } else if (data.response_obj.payload && data.response_obj.payload.is_image) {
    const file = data.response_obj.payload.url;
    const photoEmbed = { title: data.pokemon };
    data.msg.channel.send({ files: [file], embed: photoEmbed });
  } else {
    data.msg.channel.send(data.result.fulfillmentText);
  }
};

const listen = (msg) => {
  think(msg).then((data) => {
    // if (
    //   data.hasOwnProperty('response_obj') &&
    //   data.hasOwnProperty('msg') &&
    //   data.hasOwnProperty('pokemon') &&
    //   data.hasOwnProperty('result')
    // ) {
      speak(data);
    // }
  }).catch((err) => {
    console.error(err);
  });
};

module.exports = {
  listen,
};
