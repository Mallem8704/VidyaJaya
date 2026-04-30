const { OpenAI } = require('openai');

const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY || "",
});

/**
 * Generates high-quality MCQs using Groq API across various Knowledge Sectors
 * @param {string} subject 
 * @param {string} difficulty 
 * @param {string[]} weakTopics 
 * @returns {Promise<Array>}
 */
const generateQuestions = async (subject, difficulty = "medium", count = 5, weakTopics = []) => {
  const randomSeed = Math.floor(Math.random() * 1000000);
  const prompt = `
    You are a senior exam setter for professional and competitive examinations.
    Generate ${count} high-quality, conceptual, and challenging Multiple Choice Questions (MCQs) for the category: "${subject}".
    Difficulty level: ${difficulty}.
    ${weakTopics.length > 0 ? `Focus on these specific topics: ${weakTopics.join(", ")}.` : ""}

    CRITICAL INSTRUCTION FOR VARIETY: 
    - Do NOT generate common, widely known questions.
    - Pick highly specific, obscure, or recent sub-topics within the category to ensure the user rarely sees the same question twice.
    - Use this random seed to completely randomize your topic selection: ${randomSeed}.

    Requirements for each question:
    1. Standard examination format with 4 options.
    2. Only one correct answer.
    3. Detailed explanation for why the answer is correct and why other options are incorrect.
    4. Categorize by specific sub-topic and difficulty.
    5. If the category is UPSC, maintain extreme academic rigor. If it is Science & Tech or Finance, ensure technical accuracy.

    Output format: STRICT JSON ARRAY. No extra text, no markdown code blocks.
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
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
      messages: [
        { role: "system", content: "You are a helpful AI assistant that outputs only valid JSON arrays." },
        { role: "user", content: prompt }
      ]
    });

    const text = completion.choices[0].message.content;
    
    try {
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      return parsed;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("AI response format error. Please try again.");
    }
  } catch (error) {
    console.error("Groq Critical Error:", error.message);
    throw new Error("AI engine is currently over capacity or misconfigured. Please try again.");
  }
};

module.exports = { generateQuestions };
