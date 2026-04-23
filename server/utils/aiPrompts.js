const { GoogleGenerativeAI } = require("@google/generative-ai");

const getGeminiClient = () => {
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return null;
};

const getModel = () => {
    const client = getGeminiClient();
    if (client) return client.getGenerativeModel({ model: "gemini-flash-latest" });
    return null;
};

const analyzePerformance = async (topicWiseData) => {
  const model = getModel();
  
  if (!model) {
    // Mock response for development if no API key
    return {
      weakTopics: ["Economy (Budgeting)", "Modern History"],
      strongTopics: ["Science & Technology", "Polity"],
      suggestions: [
        "Focus more on Indian Economy — Chapter: Budget & Fiscal Policy",
        "Your accuracy drops in the last 30 minutes. Practice time management.",
        "You skip too many Modern History questions. Review NCERT."
      ],
      studyPlan: [
        { day: 1, focus: "Indian Economy", action: "Economy Set #12", time: "45 min" },
        { day: 2, focus: "Modern History", action: "History Set #05", time: "60 min" }
      ],
      encouragement: "You're doing great! Keep your daily streak intact and stay consistent."
    };
  }

  try {
    const prompt = `Analyze this student's performance: ${JSON.stringify(topicWiseData)}. 
    Provide: 1) Top 3 weak areas with specific chapters, 2) Top 3 strong areas, 3) 5 actionable improvement suggestions, 4) 7-day study plan, 5) An encouraging message.
    
    Respond strictly in JSON format matching this structure: 
    { 
      "weakTopics": ["string"], 
      "strongTopics": ["string"], 
      "suggestions": ["string"], 
      "studyPlan": [{"day": number, "focus": "string", "action": "string", "time": "string"}], 
      "encouragement": "string" 
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

const solveDoubt = async (questionText, imageBase64) => {
  const model = getModel();
  
  if (!model) {
    // Mock response for development
    return {
      answer: "The correct answer depends on the specifics, but generally it involves applying the core formula.",
      explanation: "This is a mocked AI solution because the real Gemini API key is missing.",
      relatedConcepts: ["Formula Application", "Basic Algebra"],
      memoryTips: "Mock Memory Tip: Practice makes perfect!"
    };
  }

  try {
    let promptParts = [`Solve this question step by step: ${questionText}`];
    
    if (imageBase64) {
      promptParts.push({
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg"
        }
      });
    }

    const systemPrompt = "You are an expert teacher for Indian competitive exams. Provide: answer, detailed explanation, related concepts, memory tips. Respond strictly in JSON structure: { \"answer\": \"string\", \"explanation\": \"string\", \"relatedConcepts\": [\"string\"], \"memoryTips\": \"string\" }";
    
    const result = await model.generateContent([systemPrompt, ...promptParts]);
    const response = await result.response;
    let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Doubt Solving Error:", error);
    throw error;
  }
};

const fetchQuestionsFromAI = async (topic, count = 5, difficulty = 'medium') => {
  const model = getModel();
  
  if (!model) {
    // Mock response
    return Array.from({ length: count }).map((_, i) => ({
      question: `Mock ${difficulty} question ${i+1} about ${topic}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 1,
      explanation: `Mock explanation for ${topic} question.`
    }));
  }

  try {
    const prompt = `You are an expert exam setter. Generate ${count} ${difficulty} MCQ questions on "${topic}". 
    Respond strictly in JSON: { "questions": [ { "question": "string", "options": ["string"], "correctIndex": number, "explanation": "string" } ] }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(text);
    return parsed.questions || [];
  } catch (error) {
    console.error("fetchQuestionsFromAI Error:", error);
    throw error;
  }
};

module.exports = { analyzePerformance, solveDoubt, fetchQuestionsFromAI };
