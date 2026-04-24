const { generateQuestions } = require('./gemini');
const { ingestLatestNews } = require('./scraper');

/**
 * Stage 2 & 3: Topic Extraction & Question Generation
 * BUG 2 FIX: Now accepts difficulty as second parameter
 */
const runAiPipeline = async (sector, difficulty = 'medium') => {
    console.log(`[PIPELINE] Processing Sector: ${sector} (Difficulty: ${difficulty})`);
    
    // Stage 1: Ingestion
    const newsCorpus = await ingestLatestNews();
    const newsText = newsCorpus.map(n => n.title + ": " + (n.content || "")).join("\n");

    // Stage 2 & 3 Combined: Use Gemini to extract facts and generate questions
    const questions = await generateQuestions(sector, difficulty, newsText ? [newsText.substring(0, 2000)] : []);

    return questions;
};

module.exports = { runAiPipeline };
