/**
 * instagramService.js
 * ──────────────────────────────────────────────────────────────────────────
 * Handles all communication with the Meta (Instagram) Graph API.
 *
 * Responsibilities:
 *   1. createMediaContainer(imageUrl, caption) — Step 1 of posting
 *   2. publishMedia(creationId)               — Step 2 of posting
 *   3. refreshAccessToken()                   — Keep the 60-day token alive
 *   4. getAccountInfo()                       — Validate credentials
 * ──────────────────────────────────────────────────────────────────────────
 */

const axios = require('axios');
const path  = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const GRAPH_API_VERSION = 'v20.0';
const GRAPH_BASE        = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// ── helpers ─────────────────────────────────────────────────────────────────

function getCredentials() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId    = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const appSecret   = process.env.META_APP_SECRET;

  if (!accessToken || !igUserId) {
    throw new Error(
      '[Instagram] Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_BUSINESS_ACCOUNT_ID in .env'
    );
  }
  return { accessToken, igUserId, appSecret };
}

// ── public API ───────────────────────────────────────────────────────────────

/**
 * Step 1 — Create a media container.
 * Instagram fetches the image from `imageUrl` and returns a container ID.
 *
 * @param {string} imageUrl  Publicly accessible HTTPS URL of the image
 * @param {string} caption   Post caption (can include hashtags)
 * @returns {Promise<string>} creationId (the container ID)
 */
async function createMediaContainer(imageUrl, caption) {
  const { accessToken, igUserId } = getCredentials();

  const url    = `${GRAPH_BASE}/${igUserId}/media`;
  const params = {
    image_url:    imageUrl,
    caption:      caption,
    access_token: accessToken,
  };

  console.log('[Instagram] Creating media container…');
  const response = await axios.post(url, params);

  if (!response.data?.id) {
    throw new Error(`[Instagram] createMediaContainer returned unexpected response: ${JSON.stringify(response.data)}`);
  }

  const creationId = response.data.id;
  console.log(`[Instagram] Container created ✓  id=${creationId}`);
  return creationId;
}

/**
 * Step 2 — Publish the container.
 * Calls the media_publish endpoint with the container ID from step 1.
 * Instagram recommends a short delay between container creation and publish.
 *
 * @param {string} creationId  Container ID from createMediaContainer()
 * @returns {Promise<string>}  The published post's media ID
 */
async function publishMedia(creationId) {
  const { accessToken, igUserId } = getCredentials();

  // Instagram recommends waiting a few seconds after container creation
  await new Promise(resolve => setTimeout(resolve, 5000));

  const url    = `${GRAPH_BASE}/${igUserId}/media_publish`;
  const params = {
    creation_id:  creationId,
    access_token: accessToken,
  };

  console.log(`[Instagram] Publishing container ${creationId}…`);
  const response = await axios.post(url, params);

  if (!response.data?.id) {
    throw new Error(`[Instagram] publishMedia returned unexpected response: ${JSON.stringify(response.data)}`);
  }

  const postId = response.data.id;
  console.log(`[Instagram] Post published ✓  ig_post_id=${postId}`);
  return postId;
}

/**
 * Refresh the long-lived access token.
 * Long-lived tokens are valid for 60 days; this should be called every ~50 days.
 * The refreshed token is printed so you can update your .env / Render secrets.
 *
 * @returns {Promise<{token: string, expires_in: number}>}
 */
async function refreshAccessToken() {
  const { accessToken, appSecret } = getCredentials();

  if (!appSecret) {
    throw new Error('[Instagram] META_APP_SECRET is required for token refresh.');
  }

  console.log('[Instagram] Refreshing access token…');

  const response = await axios.get('https://graph.instagram.com/refresh_access_token', {
    params: {
      grant_type:   'ig_refresh_token',
      access_token: accessToken,
    },
  });

  const { access_token: newToken, expires_in } = response.data;
  const expiresInDays = Math.floor(expires_in / 86400);

  console.log(`[Instagram] Token refreshed ✓  expires in ${expiresInDays} days`);
  console.log(`[Instagram] ⚠️  Update INSTAGRAM_ACCESS_TOKEN in your environment with this new token:`);
  console.log(`[Instagram] NEW TOKEN: ${newToken}`);

  return { token: newToken, expires_in };
}

/**
 * Validate stored credentials against the Graph API.
 * Returns basic account info or throws on error.
 *
 * @returns {Promise<{id: string, name: string, username: string}>}
 */
async function getAccountInfo() {
  const { accessToken, igUserId } = getCredentials();

  const response = await axios.get(`${GRAPH_BASE}/${igUserId}`, {
    params: {
      fields:       'id,name,username,biography,followers_count',
      access_token: accessToken,
    },
  });

  return response.data;
}

module.exports = {
  createMediaContainer,
  publishMedia,
  refreshAccessToken,
  getAccountInfo,
};
