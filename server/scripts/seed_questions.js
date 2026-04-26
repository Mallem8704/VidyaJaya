const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { generateQuestions } = require('../utils/groq');
const supabase = require('../config/supabase');

const CATEGORIES = [
  'UPSC & Govt Exams',
  'Daily Current Affairs',
  'Science & Technology',
  'Business & Finance',
  'Regional & State GK',
  'Civic & Electoral'
];

const TARGET_PER_CATEGORY = 1000;
const BATCH_SIZE = 10;

async function seedCategory(category) {
    console.log(`\n🚀 Checking Category: ${category}`);
    
    // 1. Check current count
    const { count, error: cErr } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('category', category);

    if (cErr) {
        console.error(`Error counting ${category}:`, cErr.message);
        return;
    }

    console.log(`Current count: ${count}`);
    let remaining = TARGET_PER_CATEGORY - count;

    if (remaining <= 0) {
        console.log(`✅ ${category} is already fully populated.`);
        return;
    }

    while (remaining > 0) {
        const currentBatch = Math.min(BATCH_SIZE, remaining);
        console.log(`   Generating batch of ${currentBatch}... (${TARGET_PER_CATEGORY - remaining}/${TARGET_PER_CATEGORY})`);
        
        try {
            // The groq utility returns an array of structured question objects
            const rawQuestions = await generateQuestions(category, 'medium'); 
            // Note: generateQuestions currently returns 5 questions by default in groq.js
            
            if (rawQuestions && rawQuestions.length > 0) {
                const formatted = rawQuestions.map(q => ({
                    text: q.question,
                    options: q.options,
                    correct_index: q.options.indexOf(q.answer) !== -1 ? q.options.indexOf(q.answer) : 0,
                    explanation: q.explanation,
                    category: category,
                    difficulty: q.difficulty?.toLowerCase() || 'medium'
                }));

                const { data, error: iErr } = await supabase.from('questions').insert(formatted).select();
                if (iErr) throw iErr;
                
                remaining -= (data?.length || 0);
                console.log(`   ✅ Successfully inserted ${data?.length || 0} questions. Remaining: ${remaining}`);
                
                // Rate limit buffer
                await new Promise(r => setTimeout(r, 2000));
            } else {
                console.warn(`   ⚠️ AI returned empty questions. Retrying...`);
                await new Promise(r => setTimeout(r, 10000));
            }
        } catch (err) {
            console.error(`   ❌ Failed batch:`, err.message);
            console.log(`   Waiting 30 seconds before retry...`);
            await new Promise(r => setTimeout(r, 30000));
        }
    }
}

async function run() {
    console.log('--- VidyaJaya Mega Seeder ---');
    for (const cat of CATEGORIES) {
        await seedCategory(cat);
    }
    console.log('\n✨ Mega Seeding Complete!');
    process.exit(0);
}

run();
