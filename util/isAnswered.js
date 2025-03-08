const isAnswered = (user_id, quiz) => {
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

module.exports = {
    isAnswered,
};