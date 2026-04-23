const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load .env from the server directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
    console.log("Listing available models...");
    
    try {
        const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
        for (const name of modelNames) {
            try {
                const model = genAI.getGenerativeModel({ model: name });
                const result = await model.generateContent("Hi");
                const response = await result.response;
                if (response.text()) {
                    console.log(`✅ Model ${name} is available!`);
                }
            } catch (e) {
                console.log(`❌ Model ${name} failed: ${e.message}`);
            }
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
