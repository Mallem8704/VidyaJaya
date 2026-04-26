const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { generateQuestions } = require('../utils/groq');
const supabase = require('../config/supabase');

const CATEGORIES = [
  { name: 'UPSC & Govt Exams', target: 50 }, // Start with 50 to avoid API limits, can scale up
  { name: 'Daily Current Affairs', target: 30 },
  { name: 'Science & Technology', target: 50 },
  { name: 'Business & Finance', target: 30 },
  { name: 'Regional & State GK', target: 30 },
  { name: 'Civic & Electoral', target: 30 }
];

async function seedCategory(category, targetCount) {
  console.log(`\n🚀 Seeding Category: ${category}`);
  let currentCount = 0;
  
  while (currentCount < targetCount) {
    try {
      console.log(`   Generating batch of 5 questions... (${currentCount}/${targetCount})`);
      const questions = await generateQuestions(category, 'medium');
      
      const questionsToInsert = questions.map(q => ({
        text: q.question,
        options: q.options,
        correct_index: q.options.indexOf(q.answer) !== -1 ? q.options.indexOf(q.answer) : 0,
        explanation: q.explanation,
        category: category,
        difficulty: q.difficulty?.toLowerCase() || 'medium'
      }));

      const { data, error } = await supabase
        .from('questions')
        .insert(questionsToInsert)
        .select();

      if (error) {
        console.error(`   ❌ Error inserting batch:`, error.message);
        break;
      }

      currentCount += data.length;
      console.log(`   ✅ Successfully inserted ${data.length} questions.`);
      
      // Sleep for a second to avoid hitting rate limits too fast
      await new Promise(r => setTimeout(r, 1000));
      
    } catch (err) {
      console.error(`   ❌ Error in loop:`, err.message);
      // Wait longer on error
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

async function run() {
  console.log('--- VidyaJaya Question Seeder ---');
  for (const cat of CATEGORIES) {
    await seedCategory(cat.name, cat.target);
  }
  console.log('\n✨ Seeding Complete!');
  process.exit(0);
}

run();
