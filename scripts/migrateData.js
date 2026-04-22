const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Initialize Supabase (using service role key to bypass RLS during migration)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mongoose Schemas (Inline to avoid import issues)
const TestSchema = new mongoose.Schema({
  title: String, description: String, category: String, totalQuestions: Number,
  totalMarks: Number, negativeMarking: Number, duration: Number, isPaid: Boolean
});
const Test = mongoose.model('Test', TestSchema);

const QuestionSchema = new mongoose.Schema({
  testId: mongoose.Schema.Types.ObjectId, text: String, options: [String],
  correctIndex: Number, explanation: String, category: String, difficulty: String
});
const Question = mongoose.model('Question', QuestionSchema);

const idMap = new Map();

const getUuid = (mongoId) => {
  if (!mongoId) return null;
  const s = mongoId.toString();
  if (idMap.has(s)) return idMap.get(s);
  const newUuid = uuidv4();
  idMap.set(s, newUuid);
  return newUuid;
};

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Migrate Tests
    console.log('Migrating Tests...');
    const mongoTests = await Test.find();
    for (const t of mongoTests) {
      const { error } = await supabase.from('tests').insert({
        id: getUuid(t._id),
        title: t.title,
        category: t.category,
        description: t.description,
        duration: (t.duration || 0) * 60,
        total_marks: t.totalMarks,
        total_questions: t.totalQuestions,
        negative_marking: t.negativeMarking,
        is_premium: t.isPaid
      });
      if (error) console.error(`Error migrating test ${t.title}:`, error);
    }
    console.log(`Migrated ${mongoTests.length} tests.`);

    // 2. Migrate Questions
    console.log('Migrating Questions...');
    const mongoQuestions = await Question.find();
    for (const q of mongoQuestions) {
      const { error } = await supabase.from('questions').insert({
        id: getUuid(q._id),
        test_id: getUuid(q.testId),
        text: q.text,
        options: q.options,
        correct_index: q.correctIndex,
        explanation: q.explanation,
        category: q.category,
        difficulty: q.difficulty
      });
      if (error) console.error(`Error migrating question:`, error);
    }
    console.log(`Migrated ${mongoQuestions.length} questions.`);

    console.log('Data migration finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
