/**
 * instagramJob.js
 * ──────────────────────────────────────────────────────────────────────────
 * Two daily Instagram posts for VidyaJaya:
 *
 *   08:00 AM IST  →  Morning Current Affairs card (every day)
 *   08:00 PM IST  →  Evening promo — alternates daily:
 *                     Odd  days → Daily Quiz Challenge card
 *                     Even days → VidyaJaya Brand/Feature promo card
 *
 * Pipeline for each post:
 *   1. (Morning only) Fetch top current affair from Supabase
 *   2. Generate branded image card (node-canvas, 1080×1080)
 *   3. Upload PNG to Supabase Storage (public bucket: instagram-posts)
 *   4. Create media container → publish via Meta Graph API
 *   5. Log result + post_type to instagram_posts table
 *
 * Extra:  Weekly cron refreshes the 60-day access token automatically.
 * ──────────────────────────────────────────────────────────────────────────
 */

const cron  = require('node-cron');
const path  = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabase = require('../config/supabase');
const {
  generatePostImage,
  generateQuizPromoImage,
  generateBrandPromoImage,
} = require('../services/imageGeneratorService');
const {
  createMediaContainer,
  publishMedia,
  refreshAccessToken,
} = require('../services/instagramService');

// ── Cron schedules (all UTC) ──────────────────────────────────────────────────
// 08:00 AM IST  =  02:30 UTC
const MORNING_CRON       = '30 2 * * *';
// 08:00 PM IST  =  14:30 UTC
const EVENING_CRON       = '30 14 * * *';
// Weekly token refresh: Every Sunday 01:00 UTC
const TOKEN_REFRESH_CRON = '0 1 * * 0';

const STORAGE_BUCKET = 'instagram-posts';

// ── Hashtag sets — trending & viral for UPSC / EdTech niche ──────────────────
const MORNING_HASHTAGS = [
  '#CurrentAffairs', '#DailyCurrentAffairs', '#CurrentAffairs2026',
  '#UPSC', '#UPSCPrep', '#UPSCAspiration', '#IASPreparation',
  '#GKToday', '#DailyGK', '#GKQuiz', '#GeneralKnowledge',
  '#SSCExam', '#SSCPreparation', '#RailwayExam', '#GovtExams',
  '#IndiaNews', '#BreakingNews', '#NationalNews',
  '#StudyMotivation', '#StudyWithMe', '#ExamPreparation',
  '#VidyaJaya', '#FreeLearning', '#EdTechIndia',
].join(' ');

const EVENING_QUIZ_HASHTAGS = [
  '#QuizTime', '#QuizChallenge', '#DailyQuiz', '#OnlineQuiz',
  '#UPSC', '#UPSCMotivation', '#UPSCDaily', '#IAS2026',
  '#GKQuiz', '#TestYourKnowledge', '#Trivia',
  '#StudyHard', '#StudyMotivation', '#ExamWarrior',
  '#SSC', '#Banking', '#RailwayExams', '#DefenceExams',
  '#CompetitiveExams', '#GovernmentJobs',
  '#VidyaJaya', '#FreeQuiz', '#PlayAndLearn',
].join(' ');

const EVENING_BRAND_HASHTAGS = [
  '#VidyaJaya', '#FreeEducation', '#LearnForFree', '#EdTechIndia',
  '#UPSC', '#UPSCPreparation', '#IASAspirant',
  '#StudyApp', '#FreeLearning', '#OnlineStudy',
  '#MakeInIndia', '#DigitalIndia', '#EducationForAll',
  '#StudyMotivation', '#StudentLife', '#AspireToInspire',
  '#GovtExams', '#SSCCracker', '#NeetPrep', '#CATPrep',
  '#TopperMindset', '#ClearIAS', '#IndiaLearns',
].join(' ');

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Day-of-year integer (1-based) — used for odd/even alternation.
 */
function dayOfYear() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

/**
 * Check if we already published a post of a given type today.
 */
async function alreadyPostedToday(postType) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from('instagram_posts')
    .select('id, ig_post_id')
    .gte('posted_at', todayStart.toISOString())
    .eq('status', 'published')
    .eq('post_type', postType)
    .maybeSingle();

  return data;
}

/**
 * Upload a PNG buffer to Supabase Storage and return its public URL.
 */
async function uploadImage(buffer, fileName) {
  await supabase.storage.from(STORAGE_BUCKET).remove([fileName]);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, buffer, {
      contentType:  'image/png',
      cacheControl: '3600',
      upsert:       true,
    });

  if (error) throw new Error(`Storage upload error: ${error.message}`);

  const supabaseUrl = process.env.SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
}

/**
 * Log a post result (success or failure) to instagram_posts table.
 */
async function logPost({ postType, currentAffairId, igPostId, imageUrl, caption, status, errorMessage }) {
  await supabase.from('instagram_posts').insert({
    current_affair_id: currentAffairId || null,
    ig_post_id:        igPostId  || null,
    image_url:         imageUrl  || null,
    caption:           caption   || null,
    post_type:         postType,
    status,
    error_message:     errorMessage || null,
  });
}

// ── MORNING PIPELINE: Current Affairs Card ────────────────────────────────────

async function runMorningPost() {
  const POST_TYPE = 'morning_current_affairs';
  console.log('[Instagram] ═══════════════════════════════════════════════');
  console.log('[Instagram] ☀️  Morning pipeline starting (Current Affairs)…');

  let affair = null;

  try {
    // Duplicate guard
    const existing = await alreadyPostedToday(POST_TYPE);
    if (existing) {
      console.log(`[Instagram] Morning post already done today (${existing.ig_post_id}). Skipping.`);
      return { success: true, skipped: true, ig_post_id: existing.ig_post_id };
    }

    // Fetch top current affair
    console.log('[Instagram] Fetching top current affair…');
    const { data: affairs, error } = await supabase
      .from('current_affairs')
      .select('id, title, summary, category, is_trending, published_at')
      .order('is_trending', { ascending: false })
      .order('published_at',  { ascending: false })
      .limit(5);

    if (error) throw new Error(`DB fetch error: ${error.message}`);
    if (!affairs?.length) throw new Error('No current affairs in database.');

    affair = affairs.find(a => a.is_trending) || affairs[0];
    console.log(`[Instagram] Selected: "${affair.title}" (${affair.category})`);

    // Generate image
    const buffer   = generatePostImage(affair);
    const dateStr  = new Date().toISOString().split('T')[0];
    const fileName = `morning-${dateStr}.png`;

    // Upload
    const imageUrl = await uploadImage(buffer, fileName);
    console.log(`[Instagram] Image uploaded ✓ ${imageUrl}`);

    // Caption
    const caption = [
      `📰 ${affair.title}`,
      affair.summary ? `\n\n${affair.summary}` : '',
      '\n\n📚 Stay updated — Free UPSC & Govt Exam Prep',
      '🔗 vidyajaya.in',
      `\n\n${MORNING_HASHTAGS}`,
    ].join('');

    // Post
    const creationId = await createMediaContainer(imageUrl, caption);
    const igPostId   = await publishMedia(creationId);

    // Log
    await logPost({ postType: POST_TYPE, currentAffairId: affair.id, igPostId, imageUrl, caption, status: 'published' });

    console.log(`[Instagram] ✅ Morning post published! ig_post_id=${igPostId}`);
    console.log('[Instagram] ═══════════════════════════════════════════════');
    return { success: true, ig_post_id: igPostId, image_url: imageUrl, post_type: POST_TYPE };

  } catch (err) {
    console.error('[Instagram] ❌ Morning pipeline failed:', err.message);
    await logPost({ postType: POST_TYPE, currentAffairId: affair?.id, status: 'failed', errorMessage: err.message });
    return { success: false, error: err.message };
  }
}

// ── EVENING PIPELINE: Quiz Promo OR Brand Promo ───────────────────────────────

async function runEveningPost() {
  const day    = dayOfYear();
  const isOdd  = day % 2 !== 0;
  const POST_TYPE = isOdd ? 'evening_quiz_promo' : 'evening_brand_promo';

  console.log('[Instagram] ═══════════════════════════════════════════════');
  console.log(`[Instagram] 🌙 Evening pipeline starting (${POST_TYPE})…`);

  try {
    // Duplicate guard
    const existing = await alreadyPostedToday(POST_TYPE);
    if (existing) {
      console.log(`[Instagram] Evening post already done today. Skipping.`);
      return { success: true, skipped: true, ig_post_id: existing.ig_post_id };
    }

    // Generate image
    let buffer;
    let caption;
    const dateStr  = new Date().toISOString().split('T')[0];

    if (isOdd) {
      // Quiz promo
      buffer = generateQuizPromoImage({ totalQuestions: '180', category: 'UPSC & Govt Exams' });
      caption = [
        "🏆 Today's Daily Quiz is LIVE on VidyaJaya!",
        '\n\n⚡ 180 Questions  |  FREE  |  Timed Test (2 hrs)',
        '\n📊 Compete on the Live Leaderboard with aspirants across India',
        '\n\n🎯 Best part? No login needed. Just play.',
        '\n🔗 vidyajaya.in',
        `\n\n${EVENING_QUIZ_HASHTAGS}`,
      ].join('');
    } else {
      // Brand promo — feature rotates daily
      buffer = generateBrandPromoImage({ dayIndex: day });
      caption = [
        '✨ Why 10,000+ aspirants choose VidyaJaya for their UPSC prep?',
        '\n\n📚 PYQs  |  Daily CA  |  AI Doubt Solver  |  Live Leaderboard',
        '\n💸 100% FREE — No subscriptions, no paywalls.',
        '\n\n🇮🇳 India ka apna free UPSC platform — VidyaJaya',
        '\n🔗 Start today at vidyajaya.in',
        `\n\n${EVENING_BRAND_HASHTAGS}`,
      ].join('');
    }

    const fileName = `evening-${dateStr}.png`;
    const imageUrl = await uploadImage(buffer, fileName);
    console.log(`[Instagram] Image uploaded ✓ ${imageUrl}`);

    // Post
    const creationId = await createMediaContainer(imageUrl, caption);
    const igPostId   = await publishMedia(creationId);

    // Log
    await logPost({ postType: POST_TYPE, igPostId, imageUrl, caption, status: 'published' });

    console.log(`[Instagram] ✅ Evening post published! ig_post_id=${igPostId}`);
    console.log('[Instagram] ═══════════════════════════════════════════════');
    return { success: true, ig_post_id: igPostId, image_url: imageUrl, post_type: POST_TYPE };

  } catch (err) {
    console.error('[Instagram] ❌ Evening pipeline failed:', err.message);
    await logPost({ postType: POST_TYPE, status: 'failed', errorMessage: err.message });
    return { success: false, error: err.message };
  }
}

// ── cron registration ─────────────────────────────────────────────────────────

function startInstagramJob() {
  // ── Morning post: 08:00 AM IST (02:30 UTC) ───────────────────────────────
  cron.schedule(MORNING_CRON, () => {
    console.log('[Instagram Job] ⏰ Morning cron triggered (8:00 AM IST)');
    runMorningPost();
  }, { timezone: 'UTC' });

  // ── Evening post: 08:00 PM IST (14:30 UTC) ───────────────────────────────
  cron.schedule(EVENING_CRON, () => {
    console.log('[Instagram Job] ⏰ Evening cron triggered (8:00 PM IST)');
    runEveningPost();
  }, { timezone: 'UTC' });

  // ── Weekly token refresh: Sunday 01:00 UTC ───────────────────────────────
  cron.schedule(TOKEN_REFRESH_CRON, async () => {
    console.log('[Instagram Job] 🔑 Weekly token refresh…');
    try {
      await refreshAccessToken();
    } catch (err) {
      console.error('[Instagram Job] Token refresh failed:', err.message);
    }
  }, { timezone: 'UTC' });

  console.log('[Instagram Job] ✓ Morning post scheduled: 08:00 AM IST');
  console.log('[Instagram Job] ✓ Evening post scheduled: 08:00 PM IST');
  console.log('[Instagram Job] ✓ Token refresh scheduled: Sundays 01:00 UTC');
}

module.exports = { startInstagramJob, runMorningPost, runEveningPost };
