const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Using gemini-flash-latest as it is available for this key
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

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

    // 2. Call Gemini
    const prompt = `
      You are VidyaJaya AI, an expert tutor for UPSC, SSC and other competitive exams. 
      Provide a concise answer, a detailed step-by-step explanation, and related concepts for the given question.
      
      Question: ${questionText}
      
      Return the response in STRICT JSON format with keys: answer, explanation, relatedConcepts (array).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean potential markdown artifacts
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiResult = JSON.parse(text);

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
