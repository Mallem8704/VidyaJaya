const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { runNewsIngestion } = require('../services/newsIngestionService');

// ── GET /api/current-affairs — paginated list with category & search filter ──
router.get('/', async (req, res) => {
  try {
    const { category, search, trending, limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from('current_affairs')
      .select('*')
      .order('published_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    if (trending === 'true') {
      query = query.eq('is_trending', true);
    }

    const { data: news, error } = await query;
    if (error) throw error;

    // Client-side search filter (works with Supabase free tier)
    let result = news;
    if (search) {
      const q = search.toLowerCase();
      result = news.filter(item =>
        item.title?.toLowerCase().includes(q) ||
        item.summary?.toLowerCase().includes(q)
      );
    }

    res.json(result);
  } catch (error) {
    console.error('Fetch current affairs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/current-affairs/trending — top 5 trending articles ─────────────
router.get('/trending', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('current_affairs')
      .select('id, title, category, is_trending, published_at, read_time')
      .eq('is_trending', true)
      .order('published_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/current-affairs/:id — single article ───────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data: article, error } = await supabase
      .from('current_affairs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ message: 'Article not found' });
      throw error;
    }
    res.json(article);
  } catch (error) {
    console.error('Fetch article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/current-affairs/admin/ingest — manual ingestion trigger ────────
router.post('/admin/ingest', async (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== (process.env.ADMIN_SECRET || 'vidyajaya-admin')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    console.log('[Admin] Manual news ingestion triggered');
    const stats = await runNewsIngestion();
    res.json({ message: 'Ingestion complete', ...stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

