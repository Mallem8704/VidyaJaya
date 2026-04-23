const path = require('path');
const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    console.log("Listing available models...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    try {
        // Note: The SDK might not have a direct listModels but we can try to see what's available
        // via a more general method or just try common ones.
        // Actually, the error message suggested calling ListModels.
        // In the JS SDK, listing models is done via the client, but the genAI object is a wrapper.
        
        const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
        for (const name of modelNames) {
            try {
                const model = genAI.getGenerativeModel({ model: name });
                const result = await model.generateContent("Hi");
                console.log(`Model ${name} is available!`);
                break; // Found one that works
            } catch (e) {
                console.log(`Model ${name} failed: ${e.message}`);
            }
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
