const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Using gemini-flash-latest as it is available for this key
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

/**
 * Generates UPSC-style MCQs using Gemini API
 * @param {string} subject 
 * @param {string} difficulty 
 * @param {string[]} weakTopics 
 * @returns {Promise<Array>}
 */
const generateQuestions = async (subject, difficulty = "medium", weakTopics = []) => {
  const prompt = `
    You are a senior UPSC (Union Public Service Commission) exam setter.
    Generate 5 high-quality, conceptual, and challenging UPSC-style Multiple Choice Questions (MCQs) for the subject: "${subject}".
    Difficulty level: ${difficulty}.
    ${weakTopics.length > 0 ? `Focus on these specific topics: ${weakTopics.join(", ")}.` : ""}

    Requirements for each question:
    1. Standard UPSC format with 4 options.
    2. Only one correct answer.
    3. Detailed explanation for why the answer is correct and why other options are incorrect.
    4. Categorize by specific topic and difficulty.

    Output format: STRICT JSON ONLY. No extra text, no markdown code blocks.
    Example structure:
    [
      {
        "question": "Which article of the Indian Constitution deals with Fundamental Rights?",
        "options": ["Article 12-35", "Article 36-51", "Article 52-78", "Article 79-122"],
        "answer": "Article 12-35",
        "explanation": "Fundamental Rights are enshrined in Part III of the Constitution (Articles 12-35). These are essential for the overall development of individuals and the preservation of human dignity.",
        "difficulty": "${difficulty}",
        "topic": "Fundamental Rights"
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean potential markdown artifacts
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (parseError) {
      console.error("JSON Parse Error in Gemini response:", parseError);
      console.log("Raw text:", text);
      throw new Error("Invalid JSON returned from AI");
    }
  } catch (error) {
    console.error("Gemini API Error details:", error);
    throw error;
  }
};

module.exports = { generateQuestions };
