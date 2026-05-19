/**
 * instagram.js (Admin Route)
 * ──────────────────────────────────────────────────────────────────────────
 * Admin-only endpoints for the Instagram automation system.
 *
 * Routes:
 *   POST /api/admin/instagram/post-now   — Manually trigger a post (for testing)
 *   GET  /api/admin/instagram/status     — View recent post history
 *   GET  /api/admin/instagram/account    — Validate Instagram credentials
 *   POST /api/admin/instagram/refresh-token — Manually trigger token refresh
 * ──────────────────────────────────────────────────────────────────────────
 */

const express = require('express');
const router  = express.Router();

const supabase                        = require('../config/supabase');
const { runMorningPost, runEveningPost } = require('../jobs/instagramJob');
const { refreshAccessToken, getAccountInfo } = require('../services/instagramService');

// ── Simple admin guard (reuse your existing pattern) ─────────────────────────
// Replace this with your real auth middleware if you have one.
function adminGuard(req, res, next) {
  const secret = req.headers['x-admin-secret'];
  const expected = process.env.ADMIN_SECRET || 'vidyajaya-admin';
  if (secret !== expected) {
    return res.status(403).json({ error: 'Forbidden — invalid admin secret' });
  }
  next();
}

// ── POST /api/admin/instagram/post-now ───────────────────────────────────────
/**
 * Manually trigger a post without waiting for the cron.
 * Use ?type=morning (default) or ?type=evening to select which post.
 *
 * Headers: x-admin-secret: <your secret>
 */
router.post('/post-now', adminGuard, async (req, res) => {
  const type = (req.query.type || 'morning').toLowerCase();
  console.log(`[Instagram Route] Manual ${type} post triggered by admin.`);
  try {
    const result = type === 'evening' ? await runEveningPost() : await runMorningPost();
    if (result.success) {
      return res.status(200).json({
        message:    result.skipped ? 'Already posted today — skipped.' : `${type} post published ✅`,
        ig_post_id: result.ig_post_id,
        image_url:  result.image_url,
        post_type:  result.post_type,
        skipped:    result.skipped || false,
      });
    } else {
      return res.status(500).json({ message: 'Post failed ❌', error: result.error });
    }
  } catch (err) {
    console.error('[Instagram Route] post-now error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/instagram/status ──────────────────────────────────────────
/**
 * Returns the last 10 Instagram post records from the database.
 */
router.get('/status', adminGuard, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('instagram_posts')
      .select('*')
      .order('posted_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return res.status(200).json({ posts: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/instagram/account ─────────────────────────────────────────
/**
 * Validates Instagram credentials by fetching the connected account info.
 */
router.get('/account', adminGuard, async (req, res) => {
  try {
    const info = await getAccountInfo();
    return res.status(200).json({ account: info });
  } catch (err) {
    return res.status(500).json({
      error:   err.message,
      hint:    'Check INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID in your .env',
    });
  }
});

// ── POST /api/admin/instagram/refresh-token ───────────────────────────────────
/**
 * Manually refresh the Instagram long-lived access token.
 * The new token is returned in the response AND logged to the console.
 * You must manually update INSTAGRAM_ACCESS_TOKEN in your environment.
 */
router.post('/refresh-token', adminGuard, async (req, res) => {
  try {
    const result = await refreshAccessToken();
    return res.status(200).json({
      message:    '✅ Token refreshed. Update INSTAGRAM_ACCESS_TOKEN in your environment.',
      new_token:  result.token,
      expires_in: result.expires_in,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
