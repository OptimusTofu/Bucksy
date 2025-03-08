const { MessageEmbed } = require("discord.js");
const puppeteer = require("puppeteer");
const CronJob = require("cron").CronJob;
const config = require("../config.json");
const Filter = require("bad-words");
const DatabaseController = require("../controllers/database.js");

const filter = new Filter();

const scrape = async (bot) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(config.qotdURL);

    const things = await page.$$(".scrollerItem:not(.Blank)");
    const questions = [];

    for (const thing of things) {
      const question = await thing.$eval("h3", (node) => node.innerText.trim());

      questions.push(question);
    }

    const question = filter.clean(
      questions[Math.floor(Math.random() * questions.length)]
    );

    if (
      DatabaseController.questionExists(question)
        .then(async function (result) {
          if (result) {
            console.debug("QOTD already asked. Moving to next scrape attempt.");
            await browser.close();
            return scrape(bot);
          } else {
            console.debug("New QOTD being asked. Writing to storage.");
            DatabaseController.addQuestion(question).catch(console.dir);

            const guild = bot.guilds.cache.get(config.guildID);
            const qotdMsg = new MessageEmbed()
              .setColor(0x009900)
              .setTitle("Question Of The Day")
              .setDescription(question);

            guild.channels.cache.get(config.channels.qotd.id).send(qotdMsg);

            await browser.close();
          }
        })
        .catch(console.dir)
    );
  } catch (err) {
    console.error("scrape error: ", err);
  }
};

const ask = async (msg) => {
  try {
    msg
      .react("🤔")
      .catch(console.error("Ask: Error fetching new QOTD!"))
      .then(console.debug("Fetching new QOTD..."));

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(config.qotdURL);

    const things = await page.$$(".scrollerItem:not(.Blank)");

    const questions = [];

    for (const thing of things) {
      const question = await thing.$eval("h3", (node) => node.innerText.trim());

      questions.push(question);
    }

    const question = filter.clean(
      questions[Math.floor(Math.random() * questions.length)]
    );

    if (
      DatabaseController.questionExists(question)
        .then(async function (result) {
          if (result) {
            console.log.debug(
              "QOTD already asked. Moving to next ask attempt using scrape."
            );
            await browser.close();
            return scrape(msg);
          } else {
            console.debug("New QOTD being asked. Writing to storage.");
            DatabaseController.addQuestion(question).catch(console.dir);

            const qotdMsg = new MessageEmbed()
              .setColor(0x009900)
              .setTitle("Question Of The Day")
              .setDescription(question);

            msg.reactions.removeAll();
            msg
              .react("✅")
              .catch(console.dir)
              .then(console.debug("Fetched QOTD successfully!"));
            msg.channel.send(qotdMsg);

            await browser.close();
          }
        })
        .catch(console.dir)
    );
  } catch (err) {
    console.error("ask error:", err);
  }
};

const start = (bot) => {
  const job = new CronJob(
    config.qotdTime,
    function () {
      console.debug("ticked QOTD timer");
      scrape(bot);
    },
    function (err) {
      console.error("qotd start error:", err);
      scrape(bot);
    },
    false,
    "America/New_York"
  );

  job.start();
};

module.exports = {
  start,
  ask,
};
