const supabase = require('../config/supabase');

const seedDefenceData = async () => {
  console.log('🚀 Starting NDA/CDS Data Seed...');

  // 1. Add exam_type column if not exists (Note: supabase-js can't run ALTER TABLE)
  // The user should run this in Supabase SQL Editor:
  // ALTER TABLE tests ADD COLUMN IF NOT EXISTS exam_type TEXT;
  // UPDATE tests SET exam_type = category WHERE exam_type IS NULL;

  const defenceTests = [
    {
      title: 'NDA Mathematics Foundation Mock',
      category: 'NDA',
      description: 'Comprehensive math test covering Algebra, Trigonometry, and Calculus for NDA aspirants.',
      duration: 5400, // 90 mins
      total_questions: 10,
      total_marks: 100,
      negative_marking: 0.83,
      is_premium: false,
      exam_type: 'NDA'
    },
    {
      title: 'CDS General Knowledge (Pro)',
      category: 'CDS',
      description: 'Advanced GK questions on Current Affairs, History, and Geography for CDS officers.',
      duration: 3600, // 60 mins
      total_questions: 10,
      total_marks: 100,
      negative_marking: 0.33,
      is_premium: true,
      exam_type: 'CDS'
    },
    {
        title: 'CDS English Proficiency',
        category: 'CDS',
        description: 'Test your vocabulary and grammar for the CDS English paper.',
        duration: 3600,
        total_questions: 5,
        total_marks: 50,
        negative_marking: 0.33,
        is_premium: false,
        exam_type: 'CDS'
    }
  ];

  for (const testData of defenceTests) {
    // Check if test already exists
    const { data: existingTest } = await supabase
      .from('tests')
      .select('id')
      .eq('title', testData.title)
      .maybeSingle();

    let testId;
    if (existingTest) {
      console.log(`ℹ️ Test already exists: ${testData.title}`);
      testId = existingTest.id;
    } else {
      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert([testData])
        .select()
        .single();

      if (testError) {
        console.error(`Error adding test ${testData.title}:`, testError);
        continue;
      }
      console.log(`✅ Added test: ${test.title}`);
      testId = test.id;
    }

    // Add some sample questions
    const sampleQuestions = [
      {
        test_id: testId,
        text: testData.category === 'NDA' ? 'What is the value of log(1) to any base?' : 'Which treaty ended the First World War?',
        options: testData.category === 'NDA' ? ['0', '1', '10', 'Infinity'] : ['Treaty of Versailles', 'Treaty of Paris', 'Treaty of London', 'Treaty of Berlin'],
        correct_index: 0,
        explanation: testData.category === 'NDA' ? 'Logarithm of 1 to any base is always 0.' : 'The Treaty of Versailles signed in 1919 officially ended World War I.',
        category: testData.category,
        difficulty: 'easy'
      }
    ];

    const { error: qError } = await supabase.from('questions').insert(sampleQuestions);
    if (qError) console.error(`Error adding questions for ${testData.title}:`, qError);
  }

  console.log('🎉 Defence Data Seed Complete!');
};

seedDefenceData();
