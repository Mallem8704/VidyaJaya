import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  { name: 'Priya Sharma', exam: 'UPSC 2024 — Cleared', quote: 'VidyaJaya\'s AI analysis told me exactly which Polity chapters I was weak in. Cleared Prelims in my first attempt.', initials: 'PS', gradient: 'linear-gradient(135deg,#00d4ff,#a855f7)' },
  { name: 'Rahul Kumar', exam: 'SSC CGL — 99 Marks', quote: 'The daily streak kept me consistent for 180 days. The leaderboard competition motivated me on tough days.', initials: 'RK', gradient: 'linear-gradient(135deg,#a855f7,#ec4899)' },
  { name: 'Sneha Patel', exam: 'SBI PO — Selected', quote: 'VidyaJaya showed my Quant accuracy was 42%. Focused practice for 3 weeks and got selected.', initials: 'SP', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)' },
  { name: 'Amit Verma', exam: 'RRB NTPC — Qualified', quote: 'The AI-generated questions were so close to the actual exam pattern. Best investment I made.', initials: 'AV', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
];

const leaders = [
  { rank: 1, name: 'Rahul K.', points: '2,840', streak: 28, badge: '🥇' },
  { rank: 2, name: 'Priya S.', points: '2,680', streak: 21, badge: '🥈' },
  { rank: 3, name: 'Sneha M.', points: '2,540', streak: 19, badge: '🥉' },
];

const communityStats = [
  { val: '12K+', label: 'Telegram Members' },
  { val: '500+', label: 'Campus Ambassadors' },
  { val: '50+', label: 'Colleges' },
];

export default function CommunitySection() {
  return (
    <section className="community-section-f" id="community">
      <div className="container-f">
        <motion.div className="section-header-f" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="section-tag-f">🌐 Community</span>
          <h2 className="section-title-f">Join the <span className="gradient-text">student movement</span></h2>
          <p className="section-sub-f">A thriving community of ambitious students helping each other succeed.</p>
        </motion.div>

        <div className="community-grid-f">
          <motion.div className="testi-column" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h3 className="col-title-f">💬 Student Stories</h3>
            <div className="testi-scroll-f">
              {testimonials.map((t, i) => (
                <div key={i} className="testi-card-f">
                  <div className="testi-stars-f">★★★★★</div>
                  <p className="testi-quote-f">"{t.quote}"</p>
                  <div className="testi-author-f">
                    <div className="testi-ava-f" style={{ background: t.gradient }}>{t.initials}</div>
                    <div>
                      <div className="testi-name-f">{t.name}</div>
                      <div className="testi-exam-f">{t.exam}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="community-right-f">
            <motion.div className="leaderboard-f" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              <div className="lb-header-f">
                <span>🏆 Live Leaderboard</span>
                <span className="lb-live">● Live</span>
              </div>
              {leaders.map((l, i) => (
                <div key={i} className="lb-row-f">
                  <span className="lb-badge-f">{l.badge}</span>
                  <div className="lb-info-f">
                    <span className="lb-name-f">{l.name}</span>
                    <span className="lb-streak-f">🔥 {l.streak} streak</span>
                  </div>
                  <span className="lb-pts-f">{l.points} pts</span>
                </div>
              ))}
            </motion.div>

            <motion.div className="community-stats-f" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
              {communityStats.map((s, i) => (
                <div key={i} className="cs-item">
                  <div className="cs-val">{s.val}</div>
                  <div className="cs-lbl">{s.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div className="avatar-stack-f" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              {['PS','RK','SP','AV','NK','RM'].map((a, i) => (
                <div key={i} className="avatar-f" style={{ zIndex: 10 - i, marginLeft: i > 0 ? '-12px' : '0' }}>{a}</div>
              ))}
              <span className="avatar-count">+2,400 this week</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
