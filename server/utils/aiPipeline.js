const { generateQuestions } = require('./gemini');
const { ingestLatestNews } = require('./scraper');

/**
 * Stage 2 & 3: Topic Extraction & Question Generation
 * Processes raw corpus into structured UPSC-style questions
 */
const runAiPipeline = async (sector) => {
    console.log(`[PIPELINE] Processing Sector: ${sector}`);
    
    // Stage 1: Ingestion
    const newsCorpus = await ingestLatestNews();
    const newsText = newsCorpus.map(n => n.title + ": " + (n.content || "")).join("\n");

    // Stage 2 & 3 Combined: We use Gemini to extract facts and generate questions in one robust context
    // This is more efficient for the 1.5 Flash context window
    const questions = await generateQuestions(sector, 'mixed', [newsText]);

    return questions;
};

module.exports = { runAiPipeline };
