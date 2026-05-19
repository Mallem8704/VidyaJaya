/**
 * newsIngestionService.js
 * ──────────────────────────────────────────────────────────────────────────
 * Fetches real news from multiple RSS/web sources and uses Groq AI
 * (llama-3.3-70b) to categorize, summarize, and tag each article for
 * the UPSC/GovtExam audience, then upserts into the current_affairs table.
 *
 * Sources:
 *   1. PIB (Press Information Bureau)  — Gold standard for UPSC
 *   2. The Hindu National RSS
 *   3. Indian Express India RSS
 *   4. Economic Times Top Stories RSS
 *   5. DD News RSS
 *
 * AI Processing per article:
 *   - UPSC-relevant summary (2-3 sentences, exam-focused)
 *   - Category classification: National | International | Economy |
 *                              Science & Tech | Sports | Environment
 *   - is_trending flag (high importance = true)
 *   - Estimated read_time
 * ──────────────────────────────────────────────────────────────────────────
 */

const Parser = require('rss-parser');
const axios  = require('axios');
const path   = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabase = require('../config/supabase');
const { OpenAI } = require('openai');

// ── Clients ──────────────────────────────────────────────────────────────────
const rssParser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'VidyaJaya-NewsBot/1.0' },
});

const groq = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey:  process.env.GROQ_API_KEY || '',
});

// ── RSS Feed Sources ──────────────────────────────────────────────────────────
const SOURCES = [
  {
    name:     'The Hindu - National',
    url:      'https://www.thehindu.com/news/national/feeder/default.rss',
    category: 'National',
    limit:    8,
  },
  {
    name:     'The Hindu - International',
    url:      'https://www.thehindu.com/news/international/feeder/default.rss',
    category: 'International',
    limit:    5,
  },
  {
    name:     'Economic Times',
    url:      'https://economictimes.indiatimes.com/rssfeedstopstories.cms',
    category: 'Economy',
    limit:    6,
  },
  {
    name:     'Indian Express - India',
    url:      'https://indianexpress.com/section/india/feed/',
    category: 'National',
    limit:    5,
  },
  {
    name:     'The Hindu - Science & Tech',
    url:      'https://www.thehindu.com/sci-tech/feeder/default.rss',
    category: 'Science & Tech',
    limit:    4,
  },
  {
    name:     'The Hindu - Sports',
    url:      'https://www.thehindu.com/sport/feeder/default.rss',
    category: 'Sports',
    limit:    3,
  },
];

// ── AI classification prompt ──────────────────────────────────────────────────
function buildAiPrompt(articles) {
  const articleList = articles.map((a, i) =>
    `${i + 1}. TITLE: ${a.title}\n   SNIPPET: ${(a.snippet || '').substring(0, 300)}`
  ).join('\n\n');

  return `You are an expert UPSC and competitive exam analyst for India.
Analyze these news articles and for each one return a JSON object.

Articles:
${articleList}

For EACH article, return:
{
  "index": <number, 1-based>,
  "summary": "<2-3 sentence UPSC-exam-focused summary. Mention key facts, names, data, significance for India.>",
  "category": "<exactly one of: National | International | Economy | Science & Tech | Sports | Environment>",
  "is_trending": <true if this is major news India/globally; false otherwise>,
  "read_time": "<e.g. 3 min read>"
}

Return ONLY a JSON array of these objects. No markdown, no extra text.`;
}

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Fetch articles from a single RSS source. Returns raw array.
 */
async function fetchFromSource(source) {
  try {
    const feed  = await rssParser.parseURL(source.url);
    const items = feed.items.slice(0, source.limit);

    return items.map(item => ({
      title:      (item.title || '').trim(),
      snippet:    (item.contentSnippet || item.summary || '').trim(),
      source_url: item.link || '',
      source:     source.name,
      hintCategory: source.category,
    })).filter(a => a.title.length > 10);

  } catch (err) {
    console.warn(`[NewsIngestion] Failed to fetch ${source.name}: ${err.message}`);
    return [];
  }
}

/**
 * Send a batch of articles to Groq AI for processing.
 * Returns an array of enriched article objects.
 */
async function processWithAi(articles) {
  if (!process.env.GROQ_API_KEY) {
    console.warn('[NewsIngestion] GROQ_API_KEY not set — using raw data without AI enrichment.');
    return articles.map((a, i) => ({
      ...a,
      summary:     a.snippet.substring(0, 300) || a.title,
      category:    a.hintCategory || 'National',
      is_trending: false,
      read_time:   '4 min read',
    }));
  }

  try {
    const prompt = buildAiPrompt(articles);
    const completion = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'You are a helpful assistant that outputs only valid JSON arrays.' },
        { role: 'user',   content: prompt },
      ],
    });

    const raw     = completion.choices[0].message.content;
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const results = JSON.parse(cleaned);

    // Merge AI results back into article objects
    return articles.map((article, i) => {
      const ai = results.find(r => r.index === i + 1) || {};
      return {
        ...article,
        summary:     ai.summary    || article.snippet.substring(0, 300) || article.title,
        category:    ai.category   || article.hintCategory || 'National',
        is_trending: ai.is_trending ?? false,
        read_time:   ai.read_time  || '4 min read',
      };
    });

  } catch (err) {
    console.error('[NewsIngestion] AI processing error:', err.message);
    // Fallback: use raw data
    return articles.map(a => ({
      ...a,
      summary:     a.snippet.substring(0, 300) || a.title,
      category:    a.hintCategory || 'National',
      is_trending: false,
      read_time:   '4 min read',
    }));
  }
}

/**
 * Check if an article with this title already exists (dedup by title).
 * Returns true if duplicate.
 */
async function isDuplicate(title) {
  const { data } = await supabase
    .from('current_affairs')
    .select('id')
    .ilike('title', title.substring(0, 100))
    .maybeSingle();
  return !!data;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Full ingestion run:
 *   1. Fetch from all RSS sources
 *   2. Deduplicate against DB
 *   3. AI-enrich in batches of 10
 *   4. Upsert into current_affairs table
 *
 * @returns {Promise<{inserted: number, skipped: number, errors: number}>}
 */
async function runNewsIngestion() {
  console.log('[NewsIngestion] ═══════════════════════════════════════════');
  console.log('[NewsIngestion] Starting daily news ingestion pipeline…');

  const stats = { inserted: 0, skipped: 0, errors: 0 };

  // 1. Fetch from all sources
  const allRaw = [];
  for (const source of SOURCES) {
    const articles = await fetchFromSource(source);
    console.log(`[NewsIngestion]   ${source.name}: ${articles.length} articles`);
    allRaw.push(...articles);
  }

  console.log(`[NewsIngestion] Total raw articles: ${allRaw.length}`);

  // 2. Deduplicate against what's already in DB
  const newArticles = [];
  for (const article of allRaw) {
    const dup = await isDuplicate(article.title);
    if (dup) {
      stats.skipped++;
    } else {
      newArticles.push(article);
    }
  }

  console.log(`[NewsIngestion] New articles (after dedup): ${newArticles.length}, skipped: ${stats.skipped}`);

  if (newArticles.length === 0) {
    console.log('[NewsIngestion] Nothing new to ingest today.');
    return stats;
  }

  // 3. AI-enrich in batches of 10 (respect rate limits)
  const BATCH_SIZE = 10;
  const enriched   = [];

  for (let i = 0; i < newArticles.length; i += BATCH_SIZE) {
    const batch = newArticles.slice(i, i + BATCH_SIZE);
    console.log(`[NewsIngestion] AI processing batch ${Math.floor(i / BATCH_SIZE) + 1}…`);
    const processed = await processWithAi(batch);
    enriched.push(...processed);

    // Small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < newArticles.length) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // 4. Insert into Supabase
  for (const article of enriched) {
    try {
      const { error } = await supabase.from('current_affairs').insert({
        title:        article.title,
        summary:      article.summary,
        content:      article.snippet || null,
        category:     article.category,
        source_url:   article.source_url || null,
        read_time:    article.read_time,
        is_trending:  article.is_trending,
        published_at: new Date().toISOString(),
      });

      if (error) {
        console.error(`[NewsIngestion] Insert error for "${article.title}": ${error.message}`);
        stats.errors++;
      } else {
        stats.inserted++;
      }
    } catch (err) {
      console.error(`[NewsIngestion] Unexpected error: ${err.message}`);
      stats.errors++;
    }
  }

  console.log(`[NewsIngestion] ✅ Done! inserted=${stats.inserted} skipped=${stats.skipped} errors=${stats.errors}`);
  console.log('[NewsIngestion] ═══════════════════════════════════════════');

  return stats;
}

module.exports = { runNewsIngestion };
