const calculateScore = (answers, questions, test) => {
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let timeTaken = 0;

  const topicWise = {};
  
  // Support both Mongo (totalQuestions) and SQL (total_questions)
  const totalQuestions = test.total_questions || test.totalQuestions;
  const totalMarks = test.total_marks || test.totalMarks;
  const negativeMarking = test.negative_marking || test.negativeMarking;

  answers.forEach(answer => {
    // Find question by id or _id
    const question = questions.find(q => {
      const qId = q.id || q._id;
      return qId && qId.toString() === answer.questionId.toString();
    });
    
    if (!question) return;

    timeTaken += (answer.timeTaken || 0);

    const topic = question.category || 'General';
    if (!topicWise[topic]) {
      topicWise[topic] = { topic, correct: 0, total: 0 };
    }
    topicWise[topic].total += 1;

    if (answer.selectedIndex === -1 || answer.selectedIndex === undefined || answer.selectedIndex === null) {
      // Handled outside loop to guarantee correct math
    } else if (answer.selectedIndex === question.correct_index || answer.selectedIndex === question.correctIndex) {
      correctCount++;
      const marksPerQ = totalMarks / totalQuestions;
      score += marksPerQ;
      topicWise[topic].correct += 1;
    } else {
      wrongCount++;
      const marksPerQ = totalMarks / totalQuestions;
      const negMarking = negativeMarking || (marksPerQ * 0.33);
      score -= negMarking;
    }
  });

  const skippedCount = totalQuestions - correctCount - wrongCount;
  const accuracy = (correctCount / totalQuestions) * 100 || 0;
  
  // Floor score to 2 decimal places
  score = Math.max(0, Math.round(score * 100) / 100);

  return {
    score,
    correctCount,
    wrong_count: wrongCount, // support snake_case for Supabase
    wrongCount,
    skipped_count: skippedCount,
    skippedCount,
    accuracy: Math.round(accuracy),
    time_taken: timeTaken,
    timeTaken,
    topicWise: Object.values(topicWise)
  };
};

module.exports = { calculateScore };

