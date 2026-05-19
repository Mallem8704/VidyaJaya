/**
 * imageGeneratorService.js
 * ──────────────────────────────────────────────────────────────────────────
 * Generates a branded 1080×1080 px VidyaJaya image card for Instagram posts.
 *
 * Uses the `canvas` npm package (Node.js implementation of the HTML Canvas API).
 * Output: PNG Buffer that can be uploaded to Supabase Storage.
 *
 * Design:
 *   • Dark gradient background (VidyaJaya brand: deep navy → rich purple)
 *   • Logo badge top-left  |  "Daily Current Affairs" label top-right
 *   • Category badge (coloured pill)
 *   • Headline (up to 3 lines, auto word-wrapping)
 *   • Summary teaser (up to 2 lines)
 *   • Bottom CTA strip: "Read more at vidyajaya.in"  +  date
 *   • Decorative geometric accent lines
 * ──────────────────────────────────────────────────────────────────────────
 */

const { createCanvas, registerFont } = require('canvas');

// ── Brand colours ────────────────────────────────────────────────────────────
const BRAND = {
  navy:        '#0D1B2A',
  navyMid:     '#1A2E4A',
  purple:      '#6C3FC5',
  purpleLight: '#9B6EFA',
  gold:        '#FFD166',
  white:       '#FFFFFF',
  offWhite:    '#E8E8F0',
  muted:       '#A0A8C0',
  accent:      '#06D6A0',  // teal accent for trending
};

// Category → colour mapping
const CATEGORY_COLORS = {
  'National':          '#3B82F6',
  'International':     '#8B5CF6',
  'Economy':           '#F59E0B',
  'Science & Tech':    '#10B981',
  'Sports':            '#EF4444',
  'Environment':       '#22C55E',
  'default':           '#6C3FC5',
};

const WIDTH  = 1080;
const HEIGHT = 1080;

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Wrap text to fit within maxWidth, returning an array of lines.
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Draw a rounded rectangle path (does NOT fill/stroke — caller does that).
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── main export ───────────────────────────────────────────────────────────────

/**
 * Generate a VidyaJaya Instagram post image card.
 *
 * @param {object} affair
 * @param {string} affair.title     - Headline text
 * @param {string} affair.summary   - Short summary (optional)
 * @param {string} affair.category  - e.g. "National", "Economy"
 * @param {boolean} affair.is_trending
 * @returns {Buffer}  PNG image buffer
 */
function generatePostImage(affair) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx    = canvas.getContext('2d');
  const today  = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const categoryColor = CATEGORY_COLORS[affair.category] || CATEGORY_COLORS['default'];

  // ── 1. Background gradient ──────────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bgGrad.addColorStop(0,    BRAND.navy);
  bgGrad.addColorStop(0.55, BRAND.navyMid);
  bgGrad.addColorStop(1,    '#1B1040');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // ── 2. Decorative geometric accents ────────────────────────────────────────
  // Top-right circular glow
  const glowGrad = ctx.createRadialGradient(WIDTH, 0, 50, WIDTH, 0, 450);
  glowGrad.addColorStop(0,   'rgba(108, 63, 197, 0.35)');
  glowGrad.addColorStop(0.5, 'rgba(108, 63, 197, 0.10)');
  glowGrad.addColorStop(1,   'rgba(108, 63, 197, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Bottom-left circular glow (teal accent)
  const glowGrad2 = ctx.createRadialGradient(0, HEIGHT, 50, 0, HEIGHT, 400);
  glowGrad2.addColorStop(0,   'rgba(6, 214, 160, 0.20)');
  glowGrad2.addColorStop(1,   'rgba(6, 214, 160, 0)');
  ctx.fillStyle = glowGrad2;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Diagonal accent lines (top-right corner)
  ctx.save();
  ctx.strokeStyle = 'rgba(155, 110, 250, 0.15)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(WIDTH - 300 + i * 40, 0);
    ctx.lineTo(WIDTH, 300 - i * 40);
    ctx.stroke();
  }
  ctx.restore();

  // ── 3. Top bar ──────────────────────────────────────────────────────────────
  // Left: VidyaJaya logo text
  ctx.font        = 'bold 52px sans-serif';
  ctx.fillStyle   = BRAND.white;
  ctx.textBaseline = 'top';
  ctx.fillText('VidyaJaya', 60, 55);

  // Purple dot accent
  ctx.beginPath();
  ctx.arc(60 + ctx.measureText('VidyaJaya').width + 12, 55 + 26, 7, 0, Math.PI * 2);
  ctx.fillStyle = BRAND.gold;
  ctx.fill();

  // Right: "Daily Current Affairs" label
  const labelText = '📰 Daily Current Affairs';
  ctx.font        = '500 28px sans-serif';
  ctx.fillStyle   = BRAND.muted;
  ctx.textAlign   = 'right';
  ctx.fillText(labelText, WIDTH - 60, 65);
  ctx.textAlign   = 'left';

  // Top separator line
  ctx.strokeStyle = 'rgba(155, 110, 250, 0.4)';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(60, 130);
  ctx.lineTo(WIDTH - 60, 130);
  ctx.stroke();

  // ── 4. Date strip ───────────────────────────────────────────────────────────
  ctx.font      = '400 26px sans-serif';
  ctx.fillStyle = BRAND.muted;
  ctx.fillText(today, 60, 155);

  // ── 5. Trending badge (if applicable) ─────────────────────────────────────
  if (affair.is_trending) {
    const trendX = 60;
    const trendY = 205;
    roundRect(ctx, trendX, trendY, 160, 44, 22);
    const trendGrad = ctx.createLinearGradient(trendX, trendY, trendX + 160, trendY);
    trendGrad.addColorStop(0, BRAND.gold);
    trendGrad.addColorStop(1, '#FF9B3C');
    ctx.fillStyle = trendGrad;
    ctx.fill();
    ctx.font      = 'bold 20px sans-serif';
    ctx.fillStyle = '#1A1A1A';
    ctx.fillText('🔥 TRENDING', trendX + 14, trendY + 13);
  }

  // ── 6. Category badge ───────────────────────────────────────────────────────
  const categoryX = affair.is_trending ? 240 : 60;
  const categoryY = 205;
  const catText   = affair.category || 'General';
  ctx.font        = 'bold 20px sans-serif';
  const catWidth  = ctx.measureText(catText).width + 36;

  roundRect(ctx, categoryX, categoryY, catWidth, 44, 22);
  ctx.fillStyle = categoryColor + '33'; // 20% opacity fill
  ctx.fill();
  roundRect(ctx, categoryX, categoryY, catWidth, 44, 22);
  ctx.strokeStyle = categoryColor;
  ctx.lineWidth   = 2;
  ctx.stroke();
  ctx.fillStyle   = categoryColor;
  ctx.fillText(catText, categoryX + 18, categoryY + 13);

  // ── 7. Headline ─────────────────────────────────────────────────────────────
  const headlineY      = 305;
  const headlineMaxW   = WIDTH - 120;
  const headlineLineH  = 80;
  const maxHeadLines   = 3;

  ctx.font = 'bold 64px sans-serif';
  ctx.fillStyle   = BRAND.white;
  ctx.textBaseline = 'top';

  const headlineLines = wrapText(ctx, affair.title || 'No Headline', headlineMaxW).slice(0, maxHeadLines);
  headlineLines.forEach((line, i) => {
    ctx.fillText(line, 60, headlineY + i * headlineLineH);
  });

  // Accent underline beneath headline
  const headlineEnd = headlineY + headlineLines.length * headlineLineH + 10;
  const accentGrad  = ctx.createLinearGradient(60, 0, 400, 0);
  accentGrad.addColorStop(0, BRAND.purple);
  accentGrad.addColorStop(1, 'rgba(108, 63, 197, 0)');
  ctx.strokeStyle = accentGrad;
  ctx.lineWidth   = 4;
  ctx.beginPath();
  ctx.moveTo(60, headlineEnd);
  ctx.lineTo(360, headlineEnd);
  ctx.stroke();

  // ── 8. Summary text ─────────────────────────────────────────────────────────
  if (affair.summary) {
    const summaryY     = headlineEnd + 40;
    const summaryMaxW  = WIDTH - 120;
    const summaryLineH = 46;

    ctx.font      = '400 34px sans-serif';
    ctx.fillStyle = BRAND.offWhite;

    const summaryLines = wrapText(ctx, affair.summary, summaryMaxW).slice(0, 3);
    summaryLines.forEach((line, i) => {
      ctx.fillText(line, 60, summaryY + i * summaryLineH);
    });
  }

  // ── 9. Divider line before CTA ──────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(155, 110, 250, 0.3)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, HEIGHT - 150);
  ctx.lineTo(WIDTH - 60, HEIGHT - 150);
  ctx.stroke();

  // ── 10. Bottom CTA strip ────────────────────────────────────────────────────
  // Left: website URL
  ctx.font        = 'bold 32px sans-serif';
  ctx.fillStyle   = BRAND.purpleLight;
  ctx.textBaseline = 'middle';
  ctx.fillText('🌐 vidyajaya.in', 60, HEIGHT - 90);

  // Right: "Free UPSC Prep"
  ctx.font        = '400 26px sans-serif';
  ctx.fillStyle   = BRAND.muted;
  ctx.textAlign   = 'right';
  ctx.fillText('Free UPSC & Govt Exam Prep', WIDTH - 60, HEIGHT - 90);
  ctx.textAlign   = 'left';

  // Purple bottom accent bar
  const barGrad = ctx.createLinearGradient(0, HEIGHT - 12, WIDTH, HEIGHT - 12);
  barGrad.addColorStop(0,   BRAND.purple);
  barGrad.addColorStop(0.5, BRAND.gold);
  barGrad.addColorStop(1,   BRAND.accent);
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, HEIGHT - 12, WIDTH, 12);

  return canvas.toBuffer('image/png');
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENING POST TYPE 1: Quiz Promo Card
// Shown on odd day-of-year evenings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a "Daily Quiz Challenge" promo card for the 8 PM post.
 *
 * @param {object} opts
 * @param {string}  opts.totalQuestions  - e.g. "180"
 * @param {string}  opts.category        - e.g. "UPSC"
 * @param {string}  opts.dateStr         - e.g. "19 May 2026"
 * @returns {Buffer} PNG image buffer
 */
function generateQuizPromoImage(opts = {}) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx    = canvas.getContext('2d');
  const today  = opts.dateStr || new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const totalQ    = opts.totalQuestions || '180';
  const category  = opts.category || 'UPSC & Govt Exams';

  // ── Background — deep gold/amber gradient ────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bgGrad.addColorStop(0,   '#0D1B2A');
  bgGrad.addColorStop(0.5, '#1C1840');
  bgGrad.addColorStop(1,   '#2A1A00');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Warm glow — top centre
  const glowC = ctx.createRadialGradient(WIDTH / 2, 0, 60, WIDTH / 2, 0, 550);
  glowC.addColorStop(0,   'rgba(255, 180, 0, 0.25)');
  glowC.addColorStop(1,   'rgba(255, 180, 0, 0)');
  ctx.fillStyle = glowC;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Bottom purple glow
  const glowB = ctx.createRadialGradient(WIDTH / 2, HEIGHT, 60, WIDTH / 2, HEIGHT, 500);
  glowB.addColorStop(0, 'rgba(108, 63, 197, 0.3)');
  glowB.addColorStop(1, 'rgba(108, 63, 197, 0)');
  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Diagonal grid lines
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.07)';
  ctx.lineWidth = 1;
  for (let i = -HEIGHT; i < WIDTH + HEIGHT; i += 60) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + HEIGHT, HEIGHT);
    ctx.stroke();
  }
  ctx.restore();

  // ── Top bar ───────────────────────────────────────────────────────────────────
  ctx.font        = 'bold 52px sans-serif';
  ctx.fillStyle   = BRAND.white;
  ctx.textBaseline = 'top';
  ctx.fillText('VidyaJaya', 60, 55);
  ctx.beginPath();
  ctx.arc(60 + ctx.measureText('VidyaJaya').width + 12, 55 + 26, 7, 0, Math.PI * 2);
  ctx.fillStyle = BRAND.gold;
  ctx.fill();

  ctx.font        = '500 28px sans-serif';
  ctx.fillStyle   = BRAND.muted;
  ctx.textAlign   = 'right';
  ctx.fillText('🎯 Daily Quiz Challenge', WIDTH - 60, 65);
  ctx.textAlign   = 'left';

  ctx.strokeStyle = 'rgba(255, 209, 102, 0.4)';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(60, 130);
  ctx.lineTo(WIDTH - 60, 130);
  ctx.stroke();

  // ── Central big emoji / graphic ───────────────────────────────────────────────
  ctx.font      = '180px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏆', WIDTH / 2, 220);
  ctx.textAlign = 'left';

  // ── Main headline ─────────────────────────────────────────────────────────────
  ctx.font        = 'bold 80px sans-serif';
  ctx.fillStyle   = BRAND.gold;
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText("Today's Quiz", WIDTH / 2, 430);

  ctx.font      = 'bold 68px sans-serif';
  ctx.fillStyle = BRAND.white;
  ctx.fillText('is LIVE! ⚡', WIDTH / 2, 520);
  ctx.textAlign = 'left';

  // ── Stats strip ───────────────────────────────────────────────────────────────
  const statsY = 640;
  // Left stat
  roundRect(ctx, 60, statsY, 280, 110, 16);
  ctx.fillStyle = 'rgba(255, 209, 102, 0.12)';
  ctx.fill();
  ctx.strokeStyle = BRAND.gold;
  ctx.lineWidth   = 2;
  roundRect(ctx, 60, statsY, 280, 110, 16);
  ctx.stroke();
  ctx.font        = 'bold 54px sans-serif';
  ctx.fillStyle   = BRAND.gold;
  ctx.textAlign   = 'center';
  ctx.fillText(totalQ, 60 + 140, statsY + 12);
  ctx.font        = '300 24px sans-serif';
  ctx.fillStyle   = BRAND.muted;
  ctx.fillText('Questions', 60 + 140, statsY + 68);

  // Middle stat
  roundRect(ctx, 400, statsY, 280, 110, 16);
  ctx.fillStyle = 'rgba(108, 63, 197, 0.20)';
  ctx.fill();
  ctx.strokeStyle = BRAND.purpleLight;
  ctx.lineWidth   = 2;
  roundRect(ctx, 400, statsY, 280, 110, 16);
  ctx.stroke();
  ctx.font        = 'bold 54px sans-serif';
  ctx.fillStyle   = BRAND.purpleLight;
  ctx.fillText('FREE', 400 + 140, statsY + 12);
  ctx.font        = '300 24px sans-serif';
  ctx.fillStyle   = BRAND.muted;
  ctx.fillText('No Login Needed', 400 + 140, statsY + 68);

  // Right stat
  roundRect(ctx, 740, statsY, 280, 110, 16);
  ctx.fillStyle = 'rgba(6, 214, 160, 0.15)';
  ctx.fill();
  ctx.strokeStyle = BRAND.accent;
  ctx.lineWidth   = 2;
  roundRect(ctx, 740, statsY, 280, 110, 16);
  ctx.stroke();
  ctx.font        = 'bold 54px sans-serif';
  ctx.fillStyle   = BRAND.accent;
  ctx.fillText('2 hr', 740 + 140, statsY + 12);
  ctx.font        = '300 24px sans-serif';
  ctx.fillStyle   = BRAND.muted;
  ctx.fillText('Timed Test', 740 + 140, statsY + 68);

  ctx.textAlign = 'left';

  // ── Subject badge ─────────────────────────────────────────────────────────────
  ctx.font      = 'bold 30px sans-serif';
  const subW    = ctx.measureText(category).width + 50;
  roundRect(ctx, (WIDTH - subW) / 2, 800, subW, 52, 26);
  const subGrad = ctx.createLinearGradient((WIDTH - subW) / 2, 800, (WIDTH + subW) / 2, 852);
  subGrad.addColorStop(0, BRAND.purple);
  subGrad.addColorStop(1, '#3B1FA0');
  ctx.fillStyle = subGrad;
  ctx.fill();
  ctx.fillStyle   = BRAND.white;
  ctx.textAlign   = 'center';
  ctx.fillText(category, WIDTH / 2, 813);
  ctx.textAlign   = 'left';

  // ── Bottom CTA ────────────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.3)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, HEIGHT - 150);
  ctx.lineTo(WIDTH - 60, HEIGHT - 150);
  ctx.stroke();

  ctx.font        = 'bold 34px sans-serif';
  ctx.fillStyle   = BRAND.gold;
  ctx.textBaseline = 'middle';
  ctx.textAlign   = 'center';
  ctx.fillText('Play now  →  vidyajaya.in', WIDTH / 2, HEIGHT - 90);
  ctx.textAlign   = 'left';

  // Bottom gradient bar
  const barGrad = ctx.createLinearGradient(0, HEIGHT - 12, WIDTH, HEIGHT - 12);
  barGrad.addColorStop(0,   BRAND.gold);
  barGrad.addColorStop(0.5, BRAND.purple);
  barGrad.addColorStop(1,   BRAND.accent);
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, HEIGHT - 12, WIDTH, 12);

  return canvas.toBuffer('image/png');
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENING POST TYPE 2: VidyaJaya Brand Promo Card
// Shown on even day-of-year evenings
// ─────────────────────────────────────────────────────────────────────────────

// Rotating feature highlights shown on brand promo cards
const FEATURES = [
  { emoji: '📚', title: 'PYQ Bank',          sub: '10,000+ Previous Year Questions' },
  { emoji: '🤖', title: 'AI Doubt Solver',   sub: 'Get instant explanations' },
  { emoji: '🏆', title: 'Live Leaderboard',  sub: 'Compete with aspirants India-wide' },
  { emoji: '📰', title: 'Daily CA Updates',  sub: 'Current Affairs every morning' },
  { emoji: '🎯', title: 'Mock Test Arena',   sub: 'Full-length tests, timed & graded' },
  { emoji: '📊', title: 'Performance Dash',  sub: 'Track your progress week-by-week' },
  { emoji: '💸', title: '100% Free',          sub: 'No paywalls. No subscriptions.' },
];

/**
 * Generate a VidyaJaya brand/features promo card for the 8 PM post.
 *
 * @param {object} opts
 * @param {number}  opts.dayIndex  - Use to pick a rotating feature (default: today's day-of-year)
 * @returns {Buffer} PNG image buffer
 */
function generateBrandPromoImage(opts = {}) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx    = canvas.getContext('2d');

  const dayIndex = opts.dayIndex !== undefined
    ? opts.dayIndex
    : Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);

  const feature = FEATURES[dayIndex % FEATURES.length];

  // ── Background — deep purple/indigo ──────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bgGrad.addColorStop(0,   '#0A0E1A');
  bgGrad.addColorStop(0.5, '#160D35');
  bgGrad.addColorStop(1,   '#0A1A2A');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Centre glow
  const centreGlow = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 80, WIDTH / 2, HEIGHT / 2, 600);
  centreGlow.addColorStop(0,   'rgba(108, 63, 197, 0.30)');
  centreGlow.addColorStop(0.5, 'rgba(108, 63, 197, 0.08)');
  centreGlow.addColorStop(1,   'rgba(108, 63, 197, 0)');
  ctx.fillStyle = centreGlow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Concentric circles
  ctx.save();
  for (let r = 100; r < 700; r += 120) {
    ctx.beginPath();
    ctx.arc(WIDTH / 2, HEIGHT / 2, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(108, 63, 197, ${0.12 - r * 0.00012})`;
    ctx.lineWidth   = 1;
    ctx.stroke();
  }
  ctx.restore();

  // ── Top bar ───────────────────────────────────────────────────────────────────
  ctx.font        = 'bold 52px sans-serif';
  ctx.fillStyle   = BRAND.white;
  ctx.textBaseline = 'top';
  ctx.fillText('VidyaJaya', 60, 55);
  ctx.beginPath();
  ctx.arc(60 + ctx.measureText('VidyaJaya').width + 12, 55 + 26, 7, 0, Math.PI * 2);
  ctx.fillStyle = BRAND.gold;
  ctx.fill();

  ctx.font        = '500 28px sans-serif';
  ctx.fillStyle   = BRAND.muted;
  ctx.textAlign   = 'right';
  ctx.fillText('✨ Why VidyaJaya?', WIDTH - 60, 65);
  ctx.textAlign   = 'left';

  ctx.strokeStyle = 'rgba(155, 110, 250, 0.4)';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(60, 130);
  ctx.lineTo(WIDTH - 60, 130);
  ctx.stroke();

  // ── Central feature card ──────────────────────────────────────────────────────
  const cardX = 90, cardY = 200, cardW = WIDTH - 180, cardH = 480;
  roundRect(ctx, cardX, cardY, cardW, cardH, 24);
  const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  cardGrad.addColorStop(0, 'rgba(108, 63, 197, 0.18)');
  cardGrad.addColorStop(1, 'rgba(60, 30, 140, 0.12)');
  ctx.fillStyle = cardGrad;
  ctx.fill();
  roundRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.strokeStyle = 'rgba(155, 110, 250, 0.50)';
  ctx.lineWidth   = 2;
  ctx.stroke();

  // Feature emoji
  ctx.font      = '160px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(feature.emoji, WIDTH / 2, cardY + 50);

  // Feature title
  ctx.font        = 'bold 80px sans-serif';
  ctx.fillStyle   = BRAND.white;
  ctx.textBaseline = 'top';
  ctx.fillText(feature.title, WIDTH / 2, cardY + 230);

  // Feature subtitle
  ctx.font      = '400 38px sans-serif';
  ctx.fillStyle = BRAND.muted;
  ctx.fillText(feature.sub, WIDTH / 2, cardY + 325);

  ctx.textAlign = 'left';

  // ── Tagline ───────────────────────────────────────────────────────────────────
  ctx.font        = 'bold 44px sans-serif';
  ctx.fillStyle   = BRAND.purpleLight;
  ctx.textAlign   = 'center';
  ctx.fillText('India ka Free UPSC Platform 🇮🇳', WIDTH / 2, 735);
  ctx.textAlign   = 'left';

  // ── Feature mini-pills row ────────────────────────────────────────────────────
  const pills = ['Free', 'No Signup', 'Daily CA', 'PYQs', 'Leaderboard'];
  let pillX = 60;
  const pillY = 820;
  ctx.font = 'bold 22px sans-serif';
  for (const pill of pills) {
    const pw = ctx.measureText(pill).width + 36;
    if (pillX + pw > WIDTH - 60) break;
    roundRect(ctx, pillX, pillY, pw, 46, 23);
    ctx.fillStyle   = 'rgba(155, 110, 250, 0.20)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(155, 110, 250, 0.50)';
    ctx.lineWidth   = 1.5;
    roundRect(ctx, pillX, pillY, pw, 46, 23);
    ctx.stroke();
    ctx.fillStyle   = BRAND.purpleLight;
    ctx.textBaseline = 'top';
    ctx.fillText(pill, pillX + 18, pillY + 12);
    pillX += pw + 14;
  }

  // ── Bottom CTA ────────────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(155, 110, 250, 0.3)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, HEIGHT - 150);
  ctx.lineTo(WIDTH - 60, HEIGHT - 150);
  ctx.stroke();

  ctx.font        = 'bold 34px sans-serif';
  ctx.fillStyle   = BRAND.purpleLight;
  ctx.textBaseline = 'middle';
  ctx.textAlign   = 'center';
  ctx.fillText('Start Free Today  →  vidyajaya.in', WIDTH / 2, HEIGHT - 90);
  ctx.textAlign   = 'left';

  // Bottom accent bar
  const barGrad = ctx.createLinearGradient(0, HEIGHT - 12, WIDTH, HEIGHT - 12);
  barGrad.addColorStop(0,   BRAND.purple);
  barGrad.addColorStop(0.5, BRAND.gold);
  barGrad.addColorStop(1,   BRAND.accent);
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, HEIGHT - 12, WIDTH, 12);

  return canvas.toBuffer('image/png');
}

module.exports = { generatePostImage, generateQuizPromoImage, generateBrandPromoImage };

