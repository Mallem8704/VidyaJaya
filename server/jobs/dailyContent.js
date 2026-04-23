const cron = require('node-cron');
const { generateQuestions } = require('../utils/gemini');
const supabase = require('../config/supabase');

const SECTORS = [
    'UPSC & Govt Exams', 
    'Daily Current Affairs', 
    'Science & Technology', 
    'Business & Finance', 
    'Regional & State GK', 
    'Civic & Electoral'
];

const startDailyContentJob = () => {
    // Run at 12 AM daily (as per the new Daily Cycle spec)
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Starting automated Daily AI Questions Generation (12 AM)...');
        
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

            // 2. Create the Test entry (30 questions per sector = 180 total)
            const { data: dailyTest, error: testError } = await supabase
                .from('tests')
                .insert({
                    title: testTitle,
                    category: 'Daily Streak',
                    total_questions: 180, 
                    total_marks: 1800, // 180 * 10
                    negative_marking: 0, // No negative marking as per new spec
                    duration: 120,
                    is_premium: false
                })
                .select()
                .single();

            if (testError) throw testError;

            // 3. Generate questions for all sectors using Gemini
            const allQuestionsToInsert = [];

            for (const sector of SECTORS) {
                try {
                    // Each sector gets 30 questions
                    // Note: generateQuestions utility generates 5 at a time, so we loop it 6 times for 30 questions
                    for (let i = 0; i < 6; i++) {
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
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                    console.log(`[CRON] Generated 30 questions for sector: ${sector}`);
                } catch (err) {
                    console.error(`[CRON] Failed to generate Gemini questions for ${sector}:`, err.message);
                }
            }

            // 4. Insert into DB in batches to prevent payload size issues
            if (allQuestionsToInsert.length > 0) {
                // Insert in batches of 50
                for (let i = 0; i < allQuestionsToInsert.length; i += 50) {
                    const batch = allQuestionsToInsert.slice(i, i + 50);
                    const { error: batchError } = await supabase
                        .from('questions')
                        .insert(batch);
                    if (batchError) throw batchError;
                }
                console.log(`[CRON] Successfully generated ${allQuestionsToInsert.length} questions for ${testTitle}`);
            }

        } catch (error) {
            console.error('[CRON] Fatal Error in dailyContentJob:', error);
        }
    });
};

module.exports = startDailyContentJob;
