/**
 * newsIngestionJob.js
 * ──────────────────────────────────────────────────────────────────────────
 * Cron job that runs the news ingestion pipeline daily at 6:00 AM IST
 * (00:30 UTC) — 2 hours before the Instagram morning post (8 AM IST)
 * so fresh content is always ready.
 *
 * Also exposes runOnce() for manual triggering via the admin endpoint.
 * ──────────────────────────────────────────────────────────────────────────
 */

const cron = require('node-cron');
const { runNewsIngestion } = require('../services/newsIngestionService');

// 6:00 AM IST = 00:30 UTC
const INGESTION_CRON = '30 0 * * *';

function startNewsIngestionJob() {
  cron.schedule(INGESTION_CRON, async () => {
    console.log('[NewsIngestion Job] ⏰ Cron triggered — 6:00 AM IST');
    try {
      await runNewsIngestion();
    } catch (err) {
      console.error('[NewsIngestion Job] Unhandled error:', err.message);
    }
  }, { timezone: 'UTC' });

  console.log('[NewsIngestion Job] ✓ Daily ingestion scheduled at 6:00 AM IST');
}

module.exports = { startNewsIngestionJob, runNewsIngestion };
