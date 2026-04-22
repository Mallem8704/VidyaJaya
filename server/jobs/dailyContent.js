const cron = require('node-cron');
const { fetchQuestionsFromAI } = require('../utils/aiPrompts');
const supabase = require('../config/supabase');

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
        const testTitle = `AI Daily Challenge: ${dateString}`;
        
        // 1. Check if today's daily test already exists in Supabase
        const { data: existingTest, error: fetchError } = await supabase
            .from('tests')
            .select('id')
            .eq('title', testTitle)
            .maybeSingle();

        if (existingTest) {
             console.log('[CRON] Daily test already exists for today. Skipping.');
             return;
        }

        // 2. Create the core Test in Supabase
        const { data: dailyTest, error: testError } = await supabase
            .from('tests')
            .insert({
                title: testTitle,
                category: 'Daily Streak',
                total_questions: SECTORS.length * QUESTIONS_PER_SECTOR,
                total_marks: SECTORS.length * QUESTIONS_PER_SECTOR * 2, // 2 marks per question
                negative_marking: 0.33,
                duration: 60, // 60 minutes
                is_premium: false
            })
            .select()
            .single();

        if (testError) throw testError;

        // 3. Generate questions for all 6 sectors
        const allQuestionsToInsert = [];

        for (const sector of SECTORS) {
            console.log(`[CRON] Generating ${QUESTIONS_PER_SECTOR} AI questions for ${sector}...`);
            
            try {
                // OpenAI API Call
                const aiQuestions = await fetchQuestionsFromAI(sector, QUESTIONS_PER_SECTOR, 'mixed');
                
                // Map the questions to Supabase Schema
                aiQuestions.forEach(q => {
                    allQuestionsToInsert.push({
                        test_id: dailyTest.id,
                        text: q.question,
                        options: q.options,
                        correct_index: q.correctIndex,
                        explanation: q.explanation,
                        category: sector
                    });
                });
            } catch (err) {
                console.error(`[CRON] Failed to generate AI questions for ${sector}:`, err.message);
            }
        }

        // 4. Batch insert all questions at once
        if (allQuestionsToInsert.length > 0) {
            const { error: batchError } = await supabase
                .from('questions')
                .insert(allQuestionsToInsert);
                
            if (batchError) throw batchError;
            console.log(`[CRON] Successfully generated AI Daily Test with ${allQuestionsToInsert.length} questions!`);
        }

    } catch (error) {
        console.error('[CRON] Fatal Error in dailyContentJob:', error);
    }
  });
};

module.exports = startDailyContentJob;

