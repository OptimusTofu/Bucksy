const https = require("https");
const fs = require("fs");
const tesseract = require("tesseract.js");
const path = require("path");
const sharp = require("sharp");

const readLevel40ImageText = (msg, attachment) => {
  msg.react("🤔").catch(console.error).then(console.info("Scanning image..."));

  const file = fs.createWriteStream(
    path.resolve("./assets/img/temp/lvl40", "image.png")
  );

  https.get(attachment.url, function (response) {
    response.pipe(file);
    response.on("end", function () {
      // let image = path.resolve(file.path);
      const output = path.resolve("./assets/img/temp/lvl40", "output.png");

      sharp(file.path)
        // .resize({
        //     width: 1080,
        //     height: 1920
        // })
        .extract({
          width: 350,
          height: 500,
          left: 0,
          top: 1100,
        })
        .toBuffer()
        .then(function (data) {
          console.info("Image cropped and saved", data);

          tesseract
            .recognize(data)
            .then((text) => {
              msg.reactions.removeAll().catch(console.error);
              const levelTxt = text.substring(0, 2);
              const isLevel40 = levelTxt === "40" ? true : false;
              let outputMsg = "";
              if (isLevel40) {
                outputMsg = `Congratulations! ${msg.author} You are now in the level 40 club.`;
              } else {
                outputMsg = `It appears you have some work to do still, ${msg.author}. You're level is only ${levelTxt}`;
              }

              msg.channel.send(outputMsg);
              msg
                .react("✅")
                .catch(console.error)
                .then(console.info("Scanned image successfully!"));
            })
            .catch((err) => {
              msg.reactions.removeAll().catch(console.error);
              msg
                .react("😵")
                .catch(console.error)
                .then(console.info("Scanned image successfully!"));
              console.error("error:", err);
            });
        })
        .catch(function (err) {
          console.error("An error occured", err);
        });
    });
  });
};

const readPokemonCountImageText = (msg, attachment) => {
  msg.react("🤔").catch(console.error).then(console.info("Scanning image..."));

  const file = fs.createWriteStream(
    path.resolve(
      "./assets/img/temp/countChallenge",
      "pokemonCount-" + msg.createdTimestamp + ".jpg"
    )
  );

  https.get(attachment.url, function (response) {
    response.pipe(file);
    response.on("end", async function () {
      await sharp(file.path)
        .resize(800, 600, {
          kernel: sharp.kernel.nearest,
          fit: "contain",
          position: "left top",
        })
        .extract({ width: 100, height: 80, left: 100, top: 20 })
        .greyscale()
        .negate()
        .toBuffer()
        .then((data) => {
          tesseract
            .recognize(data, "eng", { logger: (m) => console.log(m) })
            .then(({ data: { text } }) => {
              msg.reactions.removeAll().catch(console.error);

              console.log(text);

              const cp = text.match(/\d+/g).map(Number)[0];

              msg
                .react("✅")
                .catch(console.error)
                .then(console.info("Scanned image successfully!"));

              msg.channel.send(cp);
            })
            .catch((err) => {
              msg.reactions.removeAll().catch(console.error);
              msg
                .react("😵")
                .catch(console.error)
                .then(console.info("Scanned image with errors!"));
              console.error("error:", err);
            });
        });
    });
  });
};

module.exports = {
  readLevel40ImageText,
  readPokemonCountImageText,
};
