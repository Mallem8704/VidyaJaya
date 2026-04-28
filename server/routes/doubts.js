const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');
const { OpenAI } = require("openai");
const multer = require('multer');
const { solveImageDoubt } = require('../utils/gemini');

const upload = multer({ storage: multer.memoryStorage() });

const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY || "",
});

// Solve a doubt
router.post('/solve', protect, async (req, res) => {
  try {
    const { questionText, type } = req.body;
    const userId = req.user.id;

    // 1. Check user status & coins
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('gold_coins, silver_coins, coins, is_pro, pro_expiry')
      .eq('id', userId)
      .single();

    if (profileError || !profile) return res.status(404).json({ message: 'User profile not found' });
    
    const isPro = profile.is_pro && (!profile.pro_expiry || new Date(profile.pro_expiry) > new Date());
    const silver = profile.silver_coins || profile.coins || 0;
    const { adWatched } = req.body;

    // RULE: Free users must watch an ad OR pay 10 silver coins
    if (!isPro && !adWatched && silver < 10) {
      return res.status(403).json({ 
        message: 'Free Tier Limit: Please watch a short ad to solve this doubt, or upgrade to PRO for unlimited instant solving.',
        code: 'AD_OR_PRO_REQUIRED'
      });
    }

    const cost = (isPro || adWatched) ? 0 : 10;

    // 2. Call OpenAI
    const prompt = `
      You are VidyaJaya AI, an expert tutor for UPSC, SSC and other competitive exams. 
      Provide a concise answer, a detailed step-by-step explanation, and related concepts for the given question.
      
      Question: ${questionText}
      
      Return the response in STRICT JSON format with keys: answer, explanation, relatedConcepts (array).
    `;

    let aiResult;
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a helpful AI tutor that outputs only valid JSON objects." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      
      const text = completion.choices[0].message.content;
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      aiResult = JSON.parse(cleanedText);
    } catch (aiErr) {
      console.error("OpenAI failed:", aiErr.message);
      throw new Error("AI engine is currently over capacity. Please try again.");
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

    // 4. Deduct coins if applicable
    if (cost > 0) {
      await supabase
        .from('profiles')
        .update({ 
            silver_coins: Math.max(0, silver - cost),
            coins: Math.max(0, silver - cost) // legacy sync
        })
        .eq('id', userId);
    }

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

// Solve doubt via image scan
router.post('/solve-image', protect, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    // 1. Check user status & coins
    const { data: profile } = await supabase
      .from('profiles')
      .select('silver_coins, coins, is_pro, pro_expiry')
      .eq('id', userId)
      .single();

    const isPro = profile?.is_pro && (!profile?.pro_expiry || new Date(profile?.pro_expiry) > new Date());
    const silver = profile?.silver_coins || profile?.coins || 0;
    const { adWatched } = req.body;

    if (!isPro && !adWatched && silver < 10) {
      return res.status(403).json({ 
        message: 'Image Scan Limit: Watch an ad to unlock or upgrade to PRO.',
        code: 'AD_OR_PRO_REQUIRED'
      });
    }

    const cost = (isPro || adWatched) ? 0 : 10;

    // 2. Call Gemini Vision
    const aiResult = await solveImageDoubt(req.file.buffer, req.file.mimetype);

    // 3. Save to database
    const { data: doubt, error: doubtError } = await supabase
      .from('doubts')
      .insert({
        user_id: userId,
        question_text: aiResult.questionText,
        ai_response: JSON.stringify({
          answer: aiResult.answer,
          explanation: aiResult.explanation,
          relatedConcepts: aiResult.relatedConcepts
        }),
        topic: aiResult.topic || 'General Scan'
      })
      .select()
      .single();

    if (doubtError) throw doubtError;

    // 4. Deduct coins if applicable
    if (cost > 0) {
      await supabase
        .from('profiles')
        .update({ 
            silver_coins: Math.max(0, silver - cost),
            coins: Math.max(0, silver - cost)
        })
        .eq('id', userId);
    }

    res.json({
      id: doubt.id,
      ...aiResult
    });

  } catch (error) {
    console.error('Image Doubt Solving Error:', error);
    res.status(500).json({ message: error.message || 'Failed to process image' });
  }
});
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
