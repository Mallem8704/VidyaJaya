const { calculateScore } = require('../utils/scoring');

/**
 * SIMULATION TEST: VidyaJaya Precision Scoring Engine
 */

const mockQuestions = [
    { id: 'q1', correct_index: 0, category: 'UPSC' },
    { id: 'q2', correct_index: 1, category: 'UPSC' },
    { id: 'q3', correct_index: 2, category: 'UPSC' },
    { id: 'q4', correct_index: 3, category: 'UPSC' },
    { id: 'q5', correct_index: 0, category: 'UPSC' }
];

const mockTest = {
    total_questions: 5,
    total_marks: 50
};

console.log('--- STARTING SCORING SIMULATION ---');

// SCENARIO 1: The "Elite Warrior" (Perfect Score + Speed + Streak)
const eliteAnswers = [
    { questionId: 'q1', selectedIndex: 0, timeTaken: 2000 }, // Correct, Fast
    { questionId: 'q2', selectedIndex: 1, timeTaken: 3000 }, // Correct, Fast
    { questionId: 'q3', selectedIndex: 2, timeTaken: 1500 }, // Correct, Fast
    { questionId: 'q4', selectedIndex: 3, timeTaken: 4000 }, // Correct, Fast
    { questionId: 'q5', selectedIndex: 0, timeTaken: 2500 }  // Correct, Fast
];

const eliteResult = calculateScore(eliteAnswers, mockQuestions, mockTest);
console.log('\nSCENARIO 1: Perfect Score (Elite Warrior)');
console.log('Expectation: (50 Base + 25 Speed + 15 Streak) * 2 Multiplier = 180');
console.log('Actual Score:', eliteResult.score);
console.log('Accuracy:', eliteResult.accuracy + '%');

// SCENARIO 2: The "Steady Learner" (Mixed speed, one wrong)
const steadyAnswers = [
    { questionId: 'q1', selectedIndex: 0, timeTaken: 2000 }, // +15
    { questionId: 'q2', selectedIndex: 1, timeTaken: 8000 }, // +10 (no speed bonus)
    { questionId: 'q3', selectedIndex: 0, timeTaken: 4000 }, // WRONG (0)
    { questionId: 'q4', selectedIndex: 3, timeTaken: 3000 }, // +15
    { questionId: 'q5', selectedIndex: 0, timeTaken: 2000 }  // +15
];

const steadyResult = calculateScore(steadyAnswers, mockQuestions, mockTest);
console.log('\nSCENARIO 2: Mixed Speed & One Wrong');
console.log('Expectation: 15 + 10 + 0 + 15 + 15 = 55');
console.log('Actual Score:', steadyResult.score);

// SCENARIO 3: The "Indecisive" (Skips & Timeouts)
const indecisiveAnswers = [
    { questionId: 'q1', selectedIndex: 0, timeTaken: 2000 }, // +15
    { questionId: 'q2', selectedIndex: -1, timeTaken: 0 },    // Skip (-2)
    { questionId: 'q3', selectedIndex: 2, timeTaken: 10000 },// Correct, Slow (+10)
    // Q4 & Q5 not even answered (Skipped)
];

const indecisiveResult = calculateScore(indecisiveAnswers, mockQuestions, mockTest);
console.log('\nSCENARIO 3: Skips and Timeouts');
console.log('Expectation: 15 - 2 + 10 - 2 (Q4) - 2 (Q5) = 19');
console.log('Actual Score:', indecisiveResult.score);

console.log('\n--- SIMULATION COMPLETE ---');
