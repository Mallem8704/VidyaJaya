const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../server/.env") });

const testGemini = async () => {
    console.log("--- STARTING GEMINI DIAGNOSTIC ---");
    const key = process.env.GEMINI_API_KEY;
    
    if (!key) {
        console.error("ERROR: GEMINI_API_KEY is missing in .env");
        return;
    }

    console.log("API Key found. Attempting connection to gemini-1.5-flash...");
    
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Generate a JSON array of 1 MCQ about Indian History. {question, options, answer, explanation}";

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("SUCCESS! Gemini responded:");
        console.log(text);
    } catch (error) {
        console.error("DIAGNOSTIC FAILED:");
        console.error("Error Message:", error.message);
        if (error.status) console.error("Status Code:", error.status);
        console.error("Details:", error.stack);
    }
};

testGemini();
