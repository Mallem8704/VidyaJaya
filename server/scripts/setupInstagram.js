/**
 * setupInstagram.js
 * ──────────────────────────────────────────────────────────────────────────
 * ONE-TIME interactive setup helper for the Instagram automation.
 *
 * Run with:  node server/scripts/setupInstagram.js
 *
 * What it does:
 *   1. Guides you through the Meta Developer setup steps
 *   2. Validates your INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID
 *   3. Exchanges a short-lived token for a long-lived token (60 days)
 *   4. Confirms Supabase Storage bucket exists and is public
 *   5. Runs a test image generation (saves a preview PNG locally)
 * ──────────────────────────────────────────────────────────────────────────
 */

const path = require('path');
const fs   = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const axios     = require('axios');
const supabase  = require('../config/supabase');
const { generatePostImage } = require('../services/imageGeneratorService');

const GRAPH_API_VERSION = 'v20.0';

// ── utils ─────────────────────────────────────────────────────────────────────
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

function header(text) {
  console.log('\n' + '═'.repeat(60));
  console.log(`  ${text}`);
  console.log('═'.repeat(60));
}

function ok(msg)   { console.log(`  ✅  ${msg}`); }
function err(msg)  { console.log(`  ❌  ${msg}`); }
function info(msg) { console.log(`  ℹ️   ${msg}`); }
function warn(msg) { console.log(`  ⚠️   ${msg}`); }

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  header('VidyaJaya — Instagram Automation Setup');
  console.log('');
  console.log('  This script will validate your setup and prepare your');
  console.log('  environment for daily automated Instagram posts.');
  console.log('');

  // ── STEP 1: Prerequisites checklist ─────────────────────────────────────────
  header('STEP 1: Prerequisites Checklist');
  console.log('');
  console.log('  Before proceeding, please confirm the following are done:');
  console.log('');
  console.log('  [ ] 1. Your Instagram account is set to Business or Creator');
  console.log('  [ ] 2. Your Instagram is connected to a Facebook Page you own');
  console.log('  [ ] 3. You created a Meta Developer App at https://developers.facebook.com/');
  console.log('         → App Type: Business');
  console.log('         → Add product: Instagram Graph API');
  console.log('  [ ] 4. You added instagram_basic + instagram_content_publish permissions');
  console.log('  [ ] 5. You generated a User Access Token in Graph API Explorer');
  console.log('         → https://developers.facebook.com/tools/explorer/');
  console.log('');

  const ready = await ask('  Have you completed the steps above? (yes/no): ');
  if (ready.toLowerCase() !== 'yes' && ready.toLowerCase() !== 'y') {
    console.log('\n  Please complete the prerequisites first, then re-run this script.');
    rl.close();
    process.exit(0);
  }

  // ── STEP 2: Check environment variables ──────────────────────────────────────
  header('STEP 2: Environment Variable Check');
  console.log('');

  const accessToken  = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId     = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const appSecret    = process.env.META_APP_SECRET;
  const appId        = process.env.META_APP_ID;

  if (!accessToken) {
    err('INSTAGRAM_ACCESS_TOKEN is not set in server/.env');
    info('Get a User Access Token from: https://developers.facebook.com/tools/explorer/');
    info('Then add to server/.env: INSTAGRAM_ACCESS_TOKEN=your_token_here');
  } else {
    ok(`INSTAGRAM_ACCESS_TOKEN is set (${accessToken.substring(0, 20)}…)`);
  }

  if (!igUserId) {
    err('INSTAGRAM_BUSINESS_ACCOUNT_ID is not set in server/.env');
    info('Find it by calling: GET https://graph.facebook.com/me/accounts?access_token=TOKEN');
    info('Then from the page, call: GET https://graph.facebook.com/PAGE_ID?fields=instagram_business_account&access_token=TOKEN');
  } else {
    ok(`INSTAGRAM_BUSINESS_ACCOUNT_ID is set (${igUserId})`);
  }

  if (!appSecret) {
    warn('META_APP_SECRET is not set — token refresh will not work.');
    warn('Find it in: Meta Developer Dashboard → Your App → Settings → Basic → App Secret');
  } else {
    ok('META_APP_SECRET is set ✓');
  }

  if (!accessToken || !igUserId) {
    err('Cannot continue without required tokens. Please set them in server/.env and re-run.');
    rl.close();
    process.exit(1);
  }

  // ── STEP 3: Validate token with Graph API ────────────────────────────────────
  header('STEP 3: Validating Access Token');
  console.log('');

  try {
    const resp = await axios.get(`https://graph.facebook.com/${GRAPH_API_VERSION}/${igUserId}`, {
      params: {
        fields:       'id,name,username,biography,followers_count',
        access_token: accessToken,
      },
    });
    ok('Access token is valid! Account info:');
    console.log('');
    console.log(`     ID:        ${resp.data.id}`);
    console.log(`     Name:      ${resp.data.name}`);
    console.log(`     Username:  @${resp.data.username}`);
    console.log(`     Followers: ${resp.data.followers_count?.toLocaleString() || 'N/A'}`);
    console.log('');
  } catch (e) {
    const msg = e.response?.data?.error?.message || e.message;
    err(`Token validation failed: ${msg}`);
    info('Possible causes:');
    info('  - Token is expired (short-lived tokens last 1 hour)');
    info('  - Wrong INSTAGRAM_BUSINESS_ACCOUNT_ID');
    info('  - Missing instagram_basic permission on the token');
    rl.close();
    process.exit(1);
  }

  // ── STEP 4: Exchange for long-lived token (if short-lived) ───────────────────
  header('STEP 4: Long-Lived Token Exchange');
  console.log('');
  console.log('  Short-lived tokens expire in 1 hour.');
  console.log('  Would you like to exchange it for a long-lived token (valid 60 days)?');
  console.log('');

  const doExchange = await ask('  Exchange for long-lived token? (yes/no): ');
  if ((doExchange.toLowerCase() === 'yes' || doExchange.toLowerCase() === 'y') && appId && appSecret) {
    try {
      const resp = await axios.get('https://graph.facebook.com/oauth/access_token', {
        params: {
          grant_type:        'fb_exchange_token',
          client_id:         appId,
          client_secret:     appSecret,
          fb_exchange_token: accessToken,
        },
      });
      const newToken   = resp.data.access_token;
      const expiresIn  = resp.data.expires_in;
      const daysTilExp = Math.floor(expiresIn / 86400);

      ok(`Long-lived token obtained! Valid for ${daysTilExp} days.`);
      console.log('');
      warn('ACTION REQUIRED: Update your server/.env and Render environment with this token:');
      console.log('');
      console.log(`  INSTAGRAM_ACCESS_TOKEN=${newToken}`);
      console.log('');
    } catch (e) {
      const msg = e.response?.data?.error?.message || e.message;
      err(`Token exchange failed: ${msg}`);
      warn('META_APP_ID and META_APP_SECRET must both be set for this to work.');
    }
  } else if (doExchange.toLowerCase() === 'yes' || doExchange.toLowerCase() === 'y') {
    warn('META_APP_ID or META_APP_SECRET not set. Skipping exchange.');
    info('Add META_APP_ID and META_APP_SECRET to server/.env to enable token exchange.');
  } else {
    info('Skipped token exchange. Remember tokens expire — see STEP 4 notes in the plan.');
  }

  // ── STEP 5: Check Supabase Storage bucket ────────────────────────────────────
  header('STEP 5: Supabase Storage Bucket Check');
  console.log('');

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    const bucket = buckets.find(b => b.name === 'instagram-posts');
    if (bucket) {
      if (bucket.public) {
        ok('Bucket "instagram-posts" exists and is PUBLIC ✓');
      } else {
        warn('Bucket "instagram-posts" exists but is PRIVATE.');
        warn('Instagram requires a public URL. Make it public in Supabase Dashboard:');
        warn('  Storage → instagram-posts → Settings → Make Public');
      }
    } else {
      warn('Bucket "instagram-posts" does not exist. Creating it…');
      const { error: createErr } = await supabase.storage.createBucket('instagram-posts', {
        public: true,
        fileSizeLimit: '5MB',
      });
      if (createErr) {
        err(`Failed to create bucket: ${createErr.message}`);
      } else {
        ok('Bucket "instagram-posts" created and set to PUBLIC ✓');
      }
    }
  } catch (e) {
    err(`Supabase Storage check failed: ${e.message}`);
  }

  // ── STEP 6: Test image generation ────────────────────────────────────────────
  header('STEP 6: Test Image Generation');
  console.log('');

  try {
    const sampleAffair = {
      title:       'India Launches New Semi-Conductor Mission with ₹76,000 Crore Incentive',
      summary:     'The Union Cabinet has approved a major push to strengthen domestic semiconductor manufacturing.',
      category:    'National',
      is_trending: true,
    };

    const buffer  = generatePostImage(sampleAffair);
    const outPath = path.join(__dirname, '../scratch/instagram_preview.png');

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buffer);

    ok(`Preview image saved to: server/scratch/instagram_preview.png`);
    ok(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
    info('Open the file to preview how your Instagram posts will look.');
  } catch (e) {
    err(`Image generation failed: ${e.message}`);
    if (e.message.includes("Cannot find module 'canvas'")) {
      warn('The `canvas` package is not installed yet.');
      warn('Run: cd server && npm install canvas');
    }
  }

  // ── STEP 7: Summary ──────────────────────────────────────────────────────────
  header('Setup Complete 🎉');
  console.log('');
  console.log('  Next steps:');
  console.log('');
  console.log('  1. Make sure server/.env has all 4 keys set:');
  console.log('     INSTAGRAM_ACCESS_TOKEN');
  console.log('     INSTAGRAM_BUSINESS_ACCOUNT_ID');
  console.log('     META_APP_SECRET');
  console.log('     META_APP_ID');
  console.log('');
  console.log('  2. Run the SQL schema: server/db/instagram_posts.sql in Supabase');
  console.log('     (Dashboard → SQL Editor → paste and run)');
  console.log('');
  console.log('  3. Test a manual post:');
  console.log('     curl -X POST http://localhost:5000/api/admin/instagram/post-now \\');
  console.log('          -H "x-admin-secret: vidyajaya-admin"');
  console.log('');
  console.log('  4. The cron will auto-post every day at 08:00 AM IST 🚀');
  console.log('');

  rl.close();
}

main().catch(e => {
  console.error('Setup script error:', e);
  process.exit(1);
});
