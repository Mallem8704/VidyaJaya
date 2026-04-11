const calculateScore = (answers, questions, test) => {
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  let timeTaken = 0;

  const topicWise = {};

  answers.forEach(answer => {
    const question = questions.find(q => q._id.toString() === answer.questionId.toString());
    timeTaken += (answer.timeTaken || 0);

    const topic = question.category || 'General';
    if (!topicWise[topic]) {
      topicWise[topic] = { topic, correct: 0, total: 0 };
    }
    topicWise[topic].total += 1;

    if (answer.selectedIndex === -1 || answer.selectedIndex === undefined || answer.selectedIndex === null) {
      skippedCount++;
    } else if (answer.selectedIndex === question.correctIndex) {
      correctCount++;
      // standard marks per question = totalMarks / totalQuestions
      const marksPerQ = test.totalMarks / test.totalQuestions;
      score += marksPerQ;
      topicWise[topic].correct += 1;
    } else {
      wrongCount++;
      const marksPerQ = test.totalMarks / test.totalQuestions;
      // standard UPSC negative marking is usually 1/3rd of allotted marks
      const negMarking = test.negativeMarking || (marksPerQ * 0.33);
      score -= negMarking;
    }
  });

  const accuracy = (correctCount / (correctCount + wrongCount)) * 100 || 0;
  // Floor score to 2 decimal places
  score = Math.max(0, Math.round(score * 100) / 100);

  return {
    score,
    correctCount,
    wrongCount,
    skippedCount,
    accuracy: Math.round(accuracy),
    timeTaken,
    topicWise: Object.values(topicWise)
  };
};

module.exports = { calculateScore };
