/**
 * Calculates the score based on the VidyaJaya Precision Scoring Engine:
 * - Base Correct: +10 points
 * - Speed Bonus: +5 points if answered within 5 seconds
 * - Streak Bonus: +15 points for every 5 consecutive correct answers
 * - Perfect Score: 2x Multiplier on total score if 30/30 (adjusted for actual test size)
 * - Skip/Timeout: -2 points
 * - Wrong: 0 points (No negative marking)
 */
const calculateScore = (answers, questions, test) => {
    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    let timeTaken = 0;
    let currentStreak = 0;

    const topicWise = {};
    const totalQuestions = test.total_questions || test.totalQuestions || questions.length;

    // We use a map for faster question lookup
    const questionMap = new Map();
    questions.forEach(q => questionMap.set((q.id || q._id).toString(), q));

    answers.forEach((answer, index) => {
        const question = questionMap.get(answer.questionId.toString());
        if (!question) return;

        timeTaken += (answer.timeTaken || 0);
        const topic = question.category || 'General';
        
        if (!topicWise[topic]) {
            topicWise[topic] = { topic, correct: 0, total: 0 };
        }
        topicWise[topic].total += 1;

        // 1. Check if Skipped
        if (answer.selectedIndex === -1 || answer.selectedIndex === undefined || answer.selectedIndex === null) {
            skippedCount++;
            totalScore -= 2; // Penalty for deliberate skipping
            currentStreak = 0; // Reset streak
        } 
        // 2. Check if Correct
        else if (answer.selectedIndex === question.correct_index || answer.selectedIndex === question.correctIndex) {
            correctCount++;
            let qScore = 10; // Base Correct

            // Speed Bonus
            if (answer.timeTaken && answer.timeTaken <= 5000) { // 5 seconds in ms
                qScore += 5;
            }

            // Streak Bonus (every 5 consecutive)
            currentStreak++;
            if (currentStreak > 0 && currentStreak % 5 === 0) {
                qScore += 15;
            }

            totalScore += qScore;
            topicWise[topic].correct += 1;
        } 
        // 3. Check if Wrong
        else {
            wrongCount++;
            // 0 points for wrong (No negative marking as per new spec)
            currentStreak = 0; // Reset streak
        }
    });

    // 4. Handle remaining questions that weren't even reached (skipped)
    const unreachedCount = totalQuestions - answers.length;
    if (unreachedCount > 0) {
        skippedCount += unreachedCount;
        totalScore -= (unreachedCount * 2);
    }

    // 5. Perfect Score Multiplier
    // If all questions are correct, double the final score
    if (correctCount === totalQuestions && totalQuestions > 0) {
        totalScore = totalScore * 2;
    }

    // Ensure score doesn't go below 0 (optional, but usually better for UX)
    totalScore = Math.max(0, totalScore);

    const accuracy = totalQuestions === 0 ? 0 : (correctCount / totalQuestions) * 100;

    return {
        score: Math.round(totalScore),
        correctCount,
        wrongCount,
        wrong_count: wrongCount,
        skippedCount,
        skipped_count: skippedCount,
        accuracy: Math.round(accuracy),
        timeTaken,
        time_taken: timeTaken,
        topicWise: Object.values(topicWise)
    };
};

module.exports = { calculateScore };
