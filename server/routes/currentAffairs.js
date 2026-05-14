const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get all current affairs with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, search, trending } = req.query;
    
    let query = supabase
      .from('current_affairs')
      .select('*')
      .order('published_at', { ascending: false });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (trending === 'true') {
      query = query.eq('is_trending', true);
    }

    const { data: news, error } = await query;

    if (error) throw error;

    // Local search filter if search query is provided
    let filteredNews = news;
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredNews = news.filter(item => 
        item.title.toLowerCase().includes(lowerSearch) || 
        item.summary.toLowerCase().includes(lowerSearch)
      );
    }

    res.json(filteredNews);
  } catch (error) {
    console.error('Fetch current affairs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single current affairs article
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

module.exports = router;
