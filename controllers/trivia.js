const { MessageEmbed } = require("discord.js");
const CronJob = require("cron").CronJob;
const config = require("../config.json");
const questions = require("../assets/data/trivia.json");
const DatabaseController = require("./database.js");

let quiz;

function containsObject(obj, list) {
    for (let i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }
    return false;
}

function winnersContainsUser(user_id) {
    let exists = false;

    quiz.winners.forEach(winner => {
        if (winner.user_id === user_id) {
            exists = true;
        }
    });

    return exists;
}

function answered (user_id) {
    for (const correct_reply in quiz.correct_replies) {
        if (correct_reply.user_id === user_id && correct_reply.questionIndex === quiz.index) {
            return true;        
        }
    }
    
    for (const incorrect_reply in quiz.incorrect_replies) {
        if (incorrect_reply.user_id === user_id && incorrect_reply.questionIndex === quiz.index) {
            return true;        
        }
    }

    return false;
}

class Quiz {
    constructor (bot) {
        this.active = false;
        this.guild = bot.guilds.cache.get(config.guildID);
        this.category = this.getCategory();
        this.questions = this.getQuestions(this.category);
        this.correct_replies = [];
        this.incorrect_replies = [];
        this.winners = [];
        this.index = -1;
    }

    getCategory () {
        const categories = questions.map(q => {
            return q.category;
        });

        return categories[Math.floor(Math.random() * categories.length)];
    }

    getQuestions (category) {
        const available_questions = questions.map(q => {
            if (q.category === category) return q;
        });

        const game_questions = [];
        const count = 3;

        while (game_questions.length < count) {
            const question = available_questions[Math.floor(Math.random() * available_questions.length)];
            if (!containsObject(question, game_questions)) {
                game_questions.push(question);
            }
        }

        return game_questions;
    }

    ask () {
        this.active = true;
        const question = this.questions[this.index];
        const possible_answers = question.possible_answers;

        const triviaEmbed = new MessageEmbed()
            .setAuthor("Bucksy Trivia Game")
            .setTitle(question.content)
            .addField("\u200b", possible_answers[0])
            .addField("\u200b", possible_answers[1])
            .addField("\u200b", possible_answers[2])
            .addField("\u200b", possible_answers[3]);

        this.guild.channels.cache.get(config.channels.trivia.id).send(triviaEmbed);
    }

    start () {
        this.guild.channels.cache.get(config.channels.trivia.id).send(`New trivia game starting in 30 seconds. The category is **${this.category}**`);

        setTimeout(() => {
            const questionloop = setInterval(() => {
                if (this.index < 2) {
                    this.index++;
                    this.ask();
                } else {
                    clearInterval(questionloop);
                    this.end();
                }
            }, 1 * 60 * 1000);
        }, 30 * 1000);
    }

    end () {
        this.guild.channels.cache.get(config.channels.trivia.id).send('Trivia game has ended, thanks for playing.');
        this.active = false;

        this.correct_replies.forEach(correct_reply => {
            if (winnersContainsUser(correct_reply.user_id)) {
                this.winners.forEach(winner => {
                    if (winner.user_id === correct_reply.user_id) {
                        winner.points += correct_reply.points;
                        winner.correct++;
                    }
                });
            } else {
                this.winners.push({user_id: correct_reply.user_id, points: correct_reply.points, tag: correct_reply.tag, correct: 1});
            }
        });
    
        this.winners.forEach(winner => {
            const winMsg = new MessageEmbed()
                .setAuthor("Bucksy Trivia Game")
                .setTitle(`${winner.tag}, you just won ${winner.points} pokecoins, with ${winner.correct} correct!`);

            this.guild.channels.cache.get(config.channels.trivia.id).send(winMsg);
            DatabaseController.updateBalance(winner.user_id, winner.points).catch(console.dir);
        });
    }
}

const listen = (msg) => {
  if (msg.author.bot) return;

  if (!quiz.active) return;

  if (answered(msg.member.user.id)) return;

  if (quiz.questions[quiz.index].correct_answers.indexOf(msg.content.toLowerCase()) >= 0) {
    quiz.correct_replies.push({
        user_id: msg.member.user.id, 
        tag: msg.member.user.tag,
        questionIndex: quiz.index,
        points: quiz.questions[quiz.index].points
    });
  } else {
    quiz.incorrect_replies.push({
        user_id: msg.member.user.id, 
        tag: msg.member.user.tag,
        questionIndex: quiz.index,
        points: quiz.questions[quiz.index].points
    });
  }
};

const start = (bot) => {
    quiz = new Quiz(bot);
    quiz.start();

//   const job = new CronJob(
//     config.triviaTime,
//     function () {
//       const quiz = new Quiz();
//       quiz.start();
//     },
//     null,
//     true,
//     "America/New_York"
//   );

//   job.start();
};

module.exports = {
  start,
  listen,
};
