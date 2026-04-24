const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * Generates high-quality MCQs using OpenAI API across various Knowledge Sectors
 * @param {string} subject 
 * @param {string} difficulty 
 * @param {string[]} weakTopics 
 * @returns {Promise<Array>}
 */
const generateQuestions = async (subject, difficulty = "medium", weakTopics = []) => {
  const prompt = `
    You are a senior exam setter for professional and competitive examinations.
    Generate 5 high-quality, conceptual, and challenging Multiple Choice Questions (MCQs) for the category: "${subject}".
    Difficulty level: ${difficulty}.
    ${weakTopics.length > 0 ? `Focus on these specific topics: ${weakTopics.join(", ")}.` : ""}

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
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    console.error("OpenAI Critical Error:", error.message);
    throw new Error("AI engine is currently over capacity or misconfigured. Please try again.");
  }
};

module.exports = { generateQuestions };
