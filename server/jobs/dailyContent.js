const cron = require('node-cron');
const { fetchQuestionsFromAI } = require('../utils/aiPrompts');
const Test = require('../models/Test');
const Question = require('../models/Question');

const SECTORS = ['Polity', 'History', 'Geography', 'Economy', 'Science', 'Aptitude'];
const QUESTIONS_PER_SECTOR = 5; // 5 questions per topic for the daily test (30 total)

const startDailyContentJob = () => {
  cron.schedule('0 1 * * *', async () => {
    console.log('[CRON] Starting automated Daily AI Questions Generation...');
    
    // We check if OpenAI API key is present
    if (!process.env.OPENAI_API_KEY) {
        console.warn('[CRON] OPENAI_API_KEY is missing. Using mock questions.');
    }

    try {
        const dateString = new Date().toISOString().split('T')[0];
        
        // Check if today's daily test already exists
        const existingTest = await Test.findOne({ title: `AI Daily Challenge: ${dateString}` });
        if (existingTest) {
             console.log('[CRON] Daily test already exists for today. Skipping.');
             return;
        }

        // Create the core Test document first
        const dailyTest = new Test({
            title: `AI Daily Challenge: ${dateString}`,
            category: 'Daily Streak',
            totalQuestions: SECTORS.length * QUESTIONS_PER_SECTOR,
            totalMarks: SECTORS.length * QUESTIONS_PER_SECTOR * 2, // 2 marks per question
            negativeMarking: 0.33,
            duration: 60, // 60 minutes
            difficulty: 'mixed',
            isPaid: false
        });

        await dailyTest.save();
        let allQuestionIds = [];

        // Loop through all 6 sectors
        for (const sector of SECTORS) {
            console.log(`[CRON] Generating ${QUESTIONS_PER_SECTOR} AI questions for ${sector}...`);
            
            try {
                // OpenAI API Call
                const aiQuestions = await fetchQuestionsFromAI(sector, QUESTIONS_PER_SECTOR, 'mixed');
                
                // Parse and map the questions to MongoDB Schema
                for (const q of aiQuestions) {
                    const newQ = new Question({
                        testId: dailyTest._id,
                        text: q.question,
                        options: q.options,
                        correctIndex: q.correctIndex,
                        explanation: q.explanation,
                        category: sector
                    });
                    const savedQ = await newQ.save();
                    allQuestionIds.push(savedQ._id);
                }
            } catch (err) {
                console.error(`[CRON] Failed to generate AI questions for ${sector}:`, err.message);
            }
        }

        // Update the Test with the generated question IDs
        dailyTest.questions = allQuestionIds;
        await dailyTest.save();

        console.log(`[CRON] Successfully generated AI Daily Test with ${allQuestionIds.length} questions!`);

    } catch (error) {
        console.error('[CRON] Fatal Error in generateDailySectors:', error);
    }
  });
};

module.exports = startDailyContentJob;
