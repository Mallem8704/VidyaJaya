const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Solve a doubt
router.post('/solve', protect, async (req, res) => {
  try {
    const { questionText, type } = req.body;
    const userId = req.user.id;

    // 1. Check user coins
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', userId)
      .single();

    if (profileError || !profile) return res.status(404).json({ message: 'User profile not found' });
    
    if (profile.coins < 10) {
      return res.status(400).json({ message: 'Insufficient coins! You need 10 coins to solve a doubt.' });
    }

    // 2. Call Gemini with Safety Bypass and Fallback
    const prompt = `
      You are VidyaJaya AI, an expert tutor for UPSC, SSC and other competitive exams. 
      Provide a concise answer, a detailed step-by-step explanation, and related concepts for the given question.
      
      Question: ${questionText}
      
      Return the response in STRICT JSON format with keys: answer, explanation, relatedConcepts (array).
    `;

    let aiResult;
    try {
      // Use the stable 1.5 Flash model
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      aiResult = JSON.parse(text);
    } catch (aiErr) {
      console.warn("Primary AI failed, trying fallback...", aiErr.message);
      // Fallback to Pro model if Flash is busy
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await fallbackModel.generateContent(prompt);
      const response = await result.response;
      let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      aiResult = JSON.parse(text);
    }

    // 3. Save to database
    const { data: doubt, error: doubtError } = await supabase
      .from('doubts')
      .insert({
        user_id: userId,
        question_text: questionText,
        ai_response: JSON.stringify(aiResult),
        topic: aiResult.relatedConcepts?.[0] || 'General'
      })
      .select()
      .single();

    if (doubtError) throw doubtError;

    // 4. Deduct coins
    await supabase
      .from('profiles')
      .update({ coins: profile.coins - 10 })
      .eq('id', userId);

    res.json({
      id: doubt.id,
      questionText: doubt.question_text,
      ...aiResult
    });

  } catch (error) {
    console.error('Doubt Solving Error:', error);
    res.status(500).json({ message: 'Failed to solve doubt. Please try again.' });
  }
});

// Get user doubts history
router.get('/history', protect, async (req, res) => {
  try {
    const { data: doubts, error } = await supabase
      .from('doubts')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(doubts);
  } catch (error) {
    console.error('Fetch Doubts History Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
