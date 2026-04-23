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

const { runAiPipeline } = require('../utils/aiPipeline');

const SECTORS = [
    'UPSC & Govt Exams', 
    'Daily Current Affairs', 
    'Science & Technology', 
    'Business & Finance', 
    'Regional & State GK', 
    'Civic & Electoral'
];

const startDailyContentJob = () => {
    // Stage 6: Automated Load at 12 AM
    cron.schedule('0 0 * * *', async () => {
        console.log('[PIPELINE] Stage 6: Initiating Midnight Contest Load...');
        
        try {
            const dateString = new Date().toISOString().split('T')[0];
            const testTitle = `VidyaJaya Daily: ${dateString}`;
            
            // Avoid duplicate tests
            const { data: existingTest } = await supabase.from('tests').select('id').eq('title', testTitle).maybeSingle();
            if (existingTest) return console.log('[PIPELINE] Daily contest already loaded for today.');

            // Create the Main Test Container
            const { data: dailyTest, error: testError } = await supabase.from('tests').insert({
                title: testTitle,
                category: 'Daily Mega Contest',
                total_questions: 180, // 30 questions * 6 sectors
                total_marks: 1800,
                negative_marking: 0,
                duration: 120,
                is_premium: false
            }).select().single();

            if (testError) throw testError;

            for (const sector of SECTORS) {
                console.log(`[PIPELINE] Calibrating questions for ${sector}...`);
                const sectorQuestions = [];

                // Stage 4 & 5: Calibration Logic (10 Easy, 15 Medium, 5 Hard)
                const targets = [
                    { difficulty: 'easy', count: 10 },
                    { difficulty: 'medium', count: 15 },
                    { difficulty: 'hard', count: 5 }
                ];

                for (const target of targets) {
                    try {
                        // Request questions for specific difficulty
                        const batch = await runAiPipeline(sector, target.difficulty);
                        
                        batch.slice(0, target.count).forEach(q => {
                            sectorQuestions.push({
                                test_id: dailyTest.id,
                                text: q.question || q.text,
                                options: q.options,
                                correct_index: q.options.indexOf(q.answer),
                                explanation: q.explanation,
                                category: sector,
                                difficulty: target.difficulty
                            });
                        });
                    } catch (err) {
                        console.error(`[PIPELINE] Stage 4 Error in ${sector}:`, err.message);
                    }
                }

                // Final Load into Supabase
                if (sectorQuestions.length > 0) {
                    const { error: loadError } = await supabase.from('questions').insert(sectorQuestions);
                    if (loadError) console.error(`[PIPELINE] Stage 6 Load Error for ${sector}:`, loadError.message);
                    else console.log(`[PIPELINE] Stage 6 Success: ${sectorQuestions.length} questions live for ${sector}.`);
                }
            }

            console.log('[PIPELINE] Full 6-Stage Cycle Complete. Lobby Ready.');

        } catch (error) {
            console.error('[PIPELINE] Pipeline Crash:', error);
        }
    });
};

module.exports = startDailyContentJob;
