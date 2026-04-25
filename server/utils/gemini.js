const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Solves a doubt from an image buffer using Gemini Vision
 */
const solveImageDoubt = async (buffer, mimeType) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are an expert academic tutor for UPSC, SSC, and Banking exams.
            Analyze the attached image of a question and provide a detailed solution.
            
            Format your response as a JSON object with:
            {
                "questionText": "The extracted text of the question from the image",
                "answer": "The concise final answer",
                "explanation": "A step-by-step detailed breakdown of the solution",
                "relatedConcepts": ["Concept 1", "Concept 2"],
                "topic": "The general subject/topic of the question"
            }
            
            Return ONLY the JSON object.
        `;

        const image = {
            inlineData: {
                data: buffer.toString("base64"),
                mimeType,
            },
        };

        const result = await model.generateContent([prompt, image]);
        const response = await result.response;
        const text = response.text();
        
        // Clean and parse JSON
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Gemini Vision Error:", error);
        throw new Error("Failed to process image doubt.");
    }
};

module.exports = { solveImageDoubt };
