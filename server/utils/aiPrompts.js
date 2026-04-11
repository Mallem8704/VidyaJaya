const { OpenAI } = require('openai');

const getOpenAIClient = () => {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return null;
};

const analyzePerformance = async (topicWiseData) => {
  const openai = getOpenAIClient();
  
  if (!openai) {
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert UPSC/SSC coaching AI. Respond strictly in JSON format matching this structure: { weakTopics: string[], strongTopics: string[], suggestions: string[], studyPlan: [{day: number, focus: string, action: string, time: string}], encouragement: string }"
        },
        {
          role: "user",
          content: `Analyze this student's performance: ${JSON.stringify(topicWiseData)}. Provide: 1) Top 3 weak areas with specific chapters, 2) Top 3 strong areas, 3) 5 actionable improvement suggestions, 4) 7-day study plan, 5) An encouraging message.`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI Analysis Error:", error);
    throw error;
  }
};

const solveDoubt = async (questionText, imageBase64) => {
  const openai = getOpenAIClient();
  
  if (!openai) {
    // Mock response for development
    return {
      answer: "The correct answer depends on the specifics, but generally it involves applying the core formula.",
      explanation: "This is a mocked AI solution because the real OpenAI API key is missing. It would normally analyze your question text and image here.",
      relatedConcepts: ["Formula Application", "Basic Algebra"],
      memoryTips: "Mock Memory Tip: Practice makes perfect!"
    };
  }

  try {
    const userMessageContent = [
      { type: "text", text: `Solve this question step by step: ${questionText}` }
    ];

    if (imageBase64) {
      userMessageContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`
        }
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert teacher for Indian competitive exams. Provide: answer, detailed explanation, related concepts, memory tips. Respond strictly in JSON structure: { answer: string, explanation: string, relatedConcepts: string[], memoryTips: string }"
        },
        {
          role: "user",
          content: userMessageContent
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI Doubt Solving Error:", error);
    throw error;
  }
};

const fetchQuestionsFromAI = async (topic, count = 5, difficulty = 'medium') => {
  const openai = getOpenAIClient();
  
  if (!openai) {
    // Mock response
    return Array.from({ length: count }).map((_, i) => ({
      question: `Mock ${difficulty} question ${i+1} about ${topic}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 1,
      explanation: `Mock explanation for ${topic} question.`
    }));
  }

  try {
     const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ 
        role: "system", 
        content: `You are an expert exam setter. Generate ${count} ${difficulty} MCQ questions on "${topic}". Respond strictly in JSON: { "questions": [ { "question": string, "options": string[], "correctIndex": number, "explanation": string } ] }` 
      }],
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return parsed.questions || [];
  } catch (error) {
    console.error("fetchQuestionsFromAI Error:", error);
    throw error;
  }
};

module.exports = { analyzePerformance, solveDoubt, fetchQuestionsFromAI };
