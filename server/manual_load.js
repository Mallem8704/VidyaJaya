const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const supabase = require('./config/supabase');
const { runAiPipeline } = require('./utils/aiPipeline');

const SECTORS = [
    'UPSC & Govt Exams', 
    'Daily Current Affairs', 
    'Science & Technology', 
    'Business & Finance', 
    'Regional & State GK', 
    'Civic & Electoral'
];

const manualGenerate = async () => {
    console.log('--- STARTING MANUAL 6-STAGE PIPELINE RUN ---');
    
    try {
        const dateString = new Date().toISOString().split('T')[0];
        const testTitle = `Manual AI Load: ${dateString}_${Date.now()}`;
        
        console.log(`[PIPELINE] Creating Test: ${testTitle}`);
        const { data: dailyTest, error: testError } = await supabase.from('tests').insert({
            title: testTitle,
            category: 'Manual AI Generation',
            total_questions: 180,
            total_marks: 1800,
            negative_marking: 0,
            duration: 120,
            is_premium: false
        }).select().single();

        if (testError) throw testError;

        for (const sector of SECTORS) {
            console.log(`[PIPELINE] Processing ${sector}...`);
            const sectorQuestions = [];

            // 10 Easy, 15 Medium, 5 Hard
            const targets = [
                { difficulty: 'easy', count: 10 },
                { difficulty: 'medium', count: 15 },
                { difficulty: 'hard', count: 5 }
            ];

            for (const target of targets) {
                try {
                    const batch = await runAiPipeline(sector, target.difficulty);
                    batch.slice(0, target.count).forEach(q => {
                        sectorQuestions.push({
                            test_id: dailyTest.id,
                            text: q.question || q.text,
                            options: q.options,
                            correct_index: q.options.indexOf(q.answer) !== -1 ? q.options.indexOf(q.answer) : 0,
                            explanation: q.explanation,
                            category: sector,
                            difficulty: target.difficulty
                        });
                    });
                } catch (err) {
                    console.error(`Error in ${sector} (${target.difficulty}):`, err.message);
                }
            }

            if (sectorQuestions.length > 0) {
                const { error: loadError } = await supabase.from('questions').insert(sectorQuestions);
                if (loadError) console.error(`Load Error for ${sector}:`, loadError.message);
                else console.log(`SUCCESS: ${sectorQuestions.length} questions live for ${sector}.`);
            }
        }

        console.log('--- PIPELINE RUN COMPLETE ---');
    } catch (error) {
        console.error('CRITICAL FAILURE:', error);
    }
};

manualGenerate();
