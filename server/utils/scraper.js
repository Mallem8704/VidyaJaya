const axios = require('axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const parser = new Parser();

/**
 * Stage 1: Data Ingestion
 * Fetches latest government releases and news for UPSC context
 */
const ingestLatestNews = async () => {
    console.log('[STAGE 1] Starting Data Ingestion...');
    const corpus = [];

    try {
        // 1. PIB (Press Information Bureau) - The gold standard for UPSC
        const pibRes = await axios.get('https://pib.gov.in/allRel.aspx');
        const $ = cheerio.load(pibRes.data);
        
        $('.release_list li a').each((i, el) => {
            if (i < 10) { // Get top 10 latest releases
                corpus.push({
                    title: $(el).text().trim(),
                    source: 'PIB',
                    url: 'https://pib.gov.in/' + $(el).attr('href')
                });
            }
        });

        // 2. The Hindu RSS - Current Affairs
        const feed = await parser.parseURL('https://www.thehindu.com/news/national/feeder/default.rss');
        feed.items.slice(0, 10).forEach(item => {
            corpus.push({
                title: item.title,
                content: item.contentSnippet,
                source: 'The Hindu',
                url: item.link
            });
        });

        console.log(`[STAGE 1] Ingested ${corpus.length} raw sources.`);
        return corpus;
    } catch (error) {
        console.error('[STAGE 1] Ingestion Error:', error.message);
        return [];
    }
};

module.exports = { ingestLatestNews };
