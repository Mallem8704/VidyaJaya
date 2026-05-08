import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const cards = [
  { title: 'AI Performance Analytics', val: '87%', sub: 'Overall Accuracy', color: '#00d4ff', bars: [85, 72, 93, 68, 91] },
  { title: 'Learning Streak', val: '🔥 24 Days', sub: 'Current Streak', color: '#f59e0b', bars: [100, 100, 100, 80, 100] },
  { title: 'Rewards Earned', val: '₹2,450', sub: 'Total Earnings', color: '#10b981', bars: [40, 65, 80, 55, 90] },
  { title: 'Career Roadmap', val: '78%', sub: 'Goals Completed', color: '#a855f7', bars: [90, 78, 60, 85, 70] },
];

const recommendations = [
  { text: 'Focus on Indian Polity Ch.4-6 this week', priority: 'high' },
  { text: 'Your Quant speed improved 12% — keep going!', priority: 'good' },
  { text: 'Attempt tomorrow\'s Economics mock for bonus coins', priority: 'normal' },
];

export default function DashboardShowcase() {
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--px', `${x * 20}px`);
    el.style.setProperty('--py', `${y * 20}px`);
  };

  return (
    <section className="dashboard-section-f" id="dashboard">
      <div className="container-f">
        <motion.div className="section-header-f" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <span className="section-tag-f">🖥️ AI Dashboard</span>
          <h2 className="section-title-f">
            Your personal
            <span className="gradient-text"> AI command center</span>
          </h2>
          <p className="section-sub-f">Real-time analytics, AI recommendations, and performance tracking — all in one beautiful dashboard.</p>
        </motion.div>

        <div className="dashboard-wrap" ref={containerRef} onMouseMove={handleMouseMove}>
          <div className="dashboard-grid-f">
            {cards.map((c, i) => (
              <motion.div
                key={i}
                className="dash-card-f"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="dash-card-glow" style={{ background: c.color }} />
                <div className="dash-header">
                  <span className="dash-title">{c.title}</span>
                </div>
                <div className="dash-val" style={{ color: c.color }}>{c.val}</div>
                <div className="dash-sub">{c.sub}</div>
                <div className="dash-bars">
                  {c.bars.map((b, j) => (
                    <div key={j} className="dash-bar-track">
                      <motion.div
                        className="dash-bar-fill"
                        style={{ background: c.color }}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${b}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: j * 0.1 }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="ai-rec-panel"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="rec-header">
              <span className="rec-dot" />
              <span>Live AI Recommendations</span>
            </div>
            {recommendations.map((r, i) => (
              <div key={i} className={`rec-item priority-${r.priority}`}>
                <span className="rec-bullet" />
                <span>{r.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
