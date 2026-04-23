const path = require('path');
const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });
const { generateQuestions } = require('../utils/gemini');

async function testGemini() {
    console.log("Current Directory:", process.cwd());
    console.log("Trying to load .env from:", envPath);
    console.log("Testing Gemini API...");
    console.log("API Key exists:", !!process.env.GEMINI_API_KEY);
    
    if (!process.env.GEMINI_API_KEY) {
        console.error("CRITICAL: GEMINI_API_KEY is missing!");
        return;
    }

    try {
        const questions = await generateQuestions("Indian Polity", "easy");
        console.log("SUCCESS! Gemini returned questions:");
        console.log(JSON.stringify(questions, null, 2));
    } catch (error) {
        console.error("FAILURE! Gemini API error:");
        console.error(error);
    }
}

testGemini();
