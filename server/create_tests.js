const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const supabase = require('./config/supabase');

const createIndividualTests = async () => {
    console.log("--- CREATING INDIVIDUAL SECTOR TESTS ---");
    
    const SECTORS = [
        'UPSC & Govt Exams', 
        'Daily Current Affairs', 
        'Science & Technology', 
        'Business & Finance', 
        'Regional & State GK', 
        'Civic & Electoral'
    ];

    try {
        const dateString = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

        for (const sector of SECTORS) {
            console.log(`Creating test for ${sector}...`);
            
            // 1. Create the Test Header
            const { data: test, error: testError } = await supabase.from('tests').insert({
                title: `${sector}: Daily Challenge (${dateString})`,
                category: 'UPSC',
                total_questions: 30,
                total_marks: 300,
                negative_marking: 0,
                duration: 20 * 60, // 20 minutes
                difficulty: 'Medium',
                is_premium: false,
                is_published: true
            }).select().single();

            if (testError) {
                console.error(`Failed to create test for ${sector}:`, testError.message);
                continue;
            }

            // 2. Find questions already in the database for this sector and move them to this test
            // (Taking the 30 most recent questions for this category)
            const { data: questions, error: qError } = await supabase
                .from('questions')
                .select('id')
                .eq('category', sector)
                .order('created_at', { ascending: false })
                .limit(30);

            if (qError || !questions || questions.length === 0) {
                console.warn(`No questions found for ${sector}.`);
                continue;
            }

            const qIds = questions.map(q => q.id);
            const { error: updateError } = await supabase
                .from('questions')
                .update({ test_id: test.id })
                .in('id', qIds);

            if (updateError) console.error(`Failed to link questions for ${sector}:`, updateError.message);
            else console.log(`Successfully created ${sector} test with 30 questions!`);
        }

        console.log("--- ALL TESTS CREATED AND LINKED ---");
    } catch (err) {
        console.error("CRITICAL ERROR:", err);
    }
};

createIndividualTests();
