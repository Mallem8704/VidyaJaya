const cron = require('node-cron');
const { generateQuestions } = require('../utils/gemini');
const supabase = require('../config/supabase');

const SECTORS = ['Polity', 'History', 'Geography', 'Economy', 'Science', 'Aptitude'];

const startDailyContentJob = () => {
    // Run at 5 AM daily
    cron.schedule('0 5 * * *', async () => {
        console.log('[CRON] Starting automated Daily AI Questions Generation (5 AM)...');
        
        try {
            const dateString = new Date().toISOString().split('T')[0];
            const testTitle = `AI Daily Challenge: ${dateString}`;
            
            // 1. Check if today's daily test already exists
            const { data: existingTest } = await supabase
                .from('tests')
                .select('id')
                .eq('title', testTitle)
                .maybeSingle();

            if (existingTest) {
                 console.log('[CRON] Daily test already exists for today. Skipping.');
                 return;
            }

            // 2. Create the Test entry
            const { data: dailyTest, error: testError } = await supabase
                .from('tests')
                .insert({
                    title: testTitle,
                    category: 'Daily Streak',
                    total_questions: SECTORS.length * 5,
                    total_marks: SECTORS.length * 10,
                    negative_marking: 0.33,
                    duration: 60,
                    is_premium: false
                })
                .select()
                .single();

            if (testError) throw testError;

            // 3. Generate questions for all sectors using Gemini
            const allQuestionsToInsert = [];

            for (const sector of SECTORS) {
                try {
                    const aiQuestions = await generateQuestions(sector, 'mixed');
                    
                    aiQuestions.forEach(q => {
                        allQuestionsToInsert.push({
                            test_id: dailyTest.id,
                            text: q.question,
                            options: q.options,
                            correct_index: q.options.indexOf(q.answer),
                            explanation: q.explanation,
                            category: sector,
                            sub_topic: q.topic,
                            difficulty: q.difficulty?.toLowerCase() || 'medium'
                        });
                    });
                    
                    // Small delay to avoid API rate limits
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (err) {
                    console.error(`[CRON] Failed to generate Gemini questions for ${sector}:`, err.message);
                }
            }

            // 4. Insert into DB
            if (allQuestionsToInsert.length > 0) {
                const { error: batchError } = await supabase
                    .from('questions')
                    .insert(allQuestionsToInsert);
                    
                if (batchError) throw batchError;
                console.log(`[CRON] Generated ${allQuestionsToInsert.length} questions for ${testTitle}`);
            }

        } catch (error) {
            console.error('[CRON] Fatal Error in dailyContentJob:', error);
        }
    });
};

module.exports = startDailyContentJob;

