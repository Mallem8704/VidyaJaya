const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const testGemini = async () => {
    console.log("--- INTERNAL SERVER DIAGNOSTIC ---");
    const key = process.env.GEMINI_API_KEY;
    console.log("Using Key ending in:", key ? key.slice(-4) : "NONE");
    
    const genAI = new GoogleGenerativeAI(key || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Hello, respond with JSON: {status: 'ok'}");
        const response = await result.response;
        console.log("SUCCESS:", response.text());
    } catch (error) {
        console.error("DIAGNOSTIC ERROR:", error.message);
    }
};

testGemini();
