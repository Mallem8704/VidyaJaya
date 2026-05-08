import React from 'react';
import { motion } from 'framer-motion';

const tiers = [
  { referrals: 3, reward: 'Free Pro Week', icon: '🎁', unlocked: true },
  { referrals: 5, reward: '500 Bonus Coins', icon: '🪙', unlocked: true },
  { referrals: 10, reward: 'Premium AI Tools', icon: '🤖', unlocked: false },
  { referrals: 25, reward: 'Cash Reward ₹1000', icon: '💰', unlocked: false },
  { referrals: 50, reward: 'Campus Ambassador', icon: '🏆', unlocked: false },
];

export default function ReferralSection() {
  return (
    <section className="referral-section-f" id="referral">
      <div className="container-f">
        <motion.div className="section-header-f" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="section-tag-f">🎁 Referral Rewards</span>
          <h2 className="section-title-f">Share knowledge, <span className="gradient-text">earn rewards</span></h2>
          <p className="section-sub-f">Invite friends and unlock premium features, coins, and exclusive rewards.</p>
        </motion.div>

        <div className="referral-content-f">
          <motion.div className="referral-progress-f" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="progress-track-f">
              <motion.div className="progress-fill-f" initial={{ height: 0 }} whileInView={{ height: '40%' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: 'easeOut' }} />
              {tiers.map((t, i) => (
                <div key={i} className={`progress-node ${t.unlocked ? 'unlocked' : ''}`} style={{ top: `${i * 25}%` }}>
                  <div className="node-dot" />
                  <div className="node-label">
                    <span className="node-icon">{t.icon}</span>
                    <div>
                      <div className="node-reward">{t.reward}</div>
                      <div className="node-req">{t.referrals} referrals</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="referral-wheel-f" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="wheel-glow" />
            <div className="wheel-ring">
              <div className="wheel-center">
                <div className="wheel-val">5/10</div>
                <div className="wheel-lbl">Referrals</div>
              </div>
              <svg className="wheel-svg" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
                <circle cx="60" cy="60" r="54" stroke="url(#wheelGrad)" strokeWidth="6" fill="none" strokeDasharray={`${54 * 2 * Math.PI * 0.5} ${54 * 2 * Math.PI}`} strokeLinecap="round" transform="rotate(-90 60 60)" className="wheel-progress" />
                <defs>
                  <linearGradient id="wheelGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <p className="wheel-cta">5 more referrals to unlock <strong>Premium AI Tools</strong></p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
