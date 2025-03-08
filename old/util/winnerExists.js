const winnerExists = (user_id, quiz) => {
    let exists = false;

    quiz.winners.forEach(winner => {
        if (winner.user_id === user_id) {
            exists = true;
        }
    });

    return exists;
}

module.exports = {
    winnerExists,
};