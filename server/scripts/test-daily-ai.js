require('dotenv').config();
const { generateQuestions } = require('../utils/gemini');

async function testAiGeneration() {
    console.log('Testing AI Question Generation for subject: Polity');
    console.log('Using API Key prefix:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'MISSING');
    try {
        const questions = await generateQuestions('Polity', 'medium');
        console.log('Successfully generated questions:');
        console.log(JSON.stringify(questions, null, 2));
        
        if (questions.length > 0) {
            console.log('\n✅ AI Generation Test Passed!');
        } else {
            console.log('\n⚠️ No questions returned.');
        }
    } catch (error) {
        console.error('\n❌ AI Generation Test Failed:');
        console.error(error.message);
        if (error.stack) {
            // console.error(error.stack);
        }
    }
}

testAiGeneration();
