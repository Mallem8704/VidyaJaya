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

const generateQuestions = async (subject, difficulty = "medium", count = 5, weakTopics = []) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
            You are a senior exam setter for professional and competitive examinations in India (UPSC, SSC, Banking).
            Generate ${count} high-quality, conceptual, and challenging Multiple Choice Questions (MCQs) for the category: "${subject}".
            Difficulty level: ${difficulty}.
            ${weakTopics.length > 0 ? `Focus on these specific topics: ${weakTopics.join(", ")}.` : ""}

            Requirements for each question:
            1. Standard examination format with 4 options.
            2. Only one correct answer.
            3. Detailed explanation for why the answer is correct and why other options are incorrect.
            4. Categorize by specific sub-topic and difficulty.

            Output format: STRICT JSON ARRAY. No extra text, no markdown code blocks.
            Example structure:
            [
              {
                "question": "Which article of the Indian Constitution deals with Fundamental Rights?",
                "options": ["Article 12-35", "Article 36-51", "Article 52-78", "Article 79-122"],
                "answer": "Article 12-35",
                "explanation": "Fundamental Rights are enshrined in Part III of the Constitution (Articles 12-35).",
                "difficulty": "${difficulty}",
                "topic": "Fundamental Rights"
              }
            ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Gemini Generation Error:", error);
        throw new Error("Failed to generate questions using Gemini.");
    }
};

module.exports = { solveImageDoubt, generateQuestions };
