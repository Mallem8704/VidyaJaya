const supabase = require('../config/supabase');

/**
 * PayoutService
 * Handles the 9 PM - 10 PM Reward Pipeline
 */
class PayoutService {
  
  /**
   * STEP 1: SNAPSHOT (9:05 PM)
   * Freezes the current day's leaderboard
   */
  static async takeSnapshot() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`[PAYOUT] Taking snapshot for ${today}...`);

    try {
      // 1. Fetch top 50 Pro users from today's submissions
      const { data: rankings, error } = await supabase
        .from('submissions')
        .select(`
          user_id,
          score,
          time_taken,
          profiles ( is_pro )
        `)
        .eq('contest_date', today)
        .eq('profiles.is_pro', true)
        .order('score', { ascending: false })
        .order('time_taken', { ascending: true })
        .limit(50);

      if (error) throw error;
      if (!rankings || rankings.length === 0) {
        console.log("[PAYOUT] No submissions today. Snapshot empty.");
        return;
      }

      // 2. Insert into snapshots with ranks
      const snapshotRows = rankings.map((r, index) => ({
        contest_date: today,
        user_id: r.user_id,
        score: r.score,
        time_taken: r.time_taken,
        rank: index + 1,
        is_verified: true // Will be verified in next step
      }));

      const { error: insErr } = await supabase
        .from('leaderboard_snapshots')
        .insert(snapshotRows);

      if (insErr) throw insErr;
      console.log(`[PAYOUT] Snapshot saved: ${snapshotRows.length} users.`);
      
    } catch (err) {
      console.error('[PAYOUT] Snapshot Error:', err);
    }
  }

  /**
   * STEP 2: VERIFY (9:10 PM)
   * Checks snapshots for cheating patterns
   */
  static async verifyWinners() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`[PAYOUT] Verifying winners for ${today}...`);

    try {
      const { data: snapshots, error } = await supabase
        .from('leaderboard_snapshots')
        .select('*')
        .eq('contest_date', today);

      if (error) throw error;

      for (const snap of snapshots) {
        let isVerified = true;
        let reason = '';

        // Anti-Cheat: Abnormal speed (< 3s avg per question for high score)
        // Assume 30 questions. If time < 90s and score > 250, flag.
        if (snap.score > 250 && snap.time_taken < 90) {
          isVerified = false;
          reason = 'Abnormal Speed Detection';
        }

        if (!isVerified) {
          await supabase
            .from('leaderboard_snapshots')
            .update({ is_verified: false, flag_reason: reason })
            .eq('id', snap.id);
        }
      }
      console.log("[PAYOUT] Verification complete.");
    } catch (err) {
      console.error('[PAYOUT] Verification Error:', err);
    }
  }

  /**
   * STEP 3 & 4: PAYOUT (10:00 PM)
   * Pays out coins to top 3 verified users
   */
  static async executePayout() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`[PAYOUT] Executing payout for ${today}...`);

    try {
      // 1. Get Top 3 Verified
      const { data: winners, error } = await supabase
        .from('leaderboard_snapshots')
        .select('user_id, rank')
        .eq('contest_date', today)
        .eq('is_verified', true)
        .order('rank', { ascending: true })
        .limit(3);

      if (error) throw error;

      const rewardMap = { 1: 100, 2: 60, 3: 40 };

      for (const winner of winners) {
        const amount = rewardMap[winner.rank] || 0;
        
        // Update Wallet (profiles table)
        const { data: profile } = await supabase
          .from('profiles')
          .select('coins, total_earnings')
          .eq('id', winner.user_id)
          .single();

        await supabase
          .from('profiles')
          .update({
            coins: (profile.coins || 0) + amount,
            total_earnings: (profile.total_earnings || 0) + amount
          })
          .eq('id', winner.user_id);

        // Record Reward
        await supabase
          .from('rewards_ledger')
          .insert({
            user_id: winner.user_id,
            contest_date: today,
            rank: winner.rank,
            amount: amount,
            status: 'paid'
          });

        console.log(`[PAYOUT] Paid ${amount} coins to Rank #${winner.rank} (User: ${winner.user_id})`);
      }
      
    } catch (err) {
      console.error('[PAYOUT] Payout Execution Error:', err);
    }
  }
}

module.exports = PayoutService;
