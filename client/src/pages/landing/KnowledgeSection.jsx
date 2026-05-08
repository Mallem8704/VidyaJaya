import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  { title: 'Learn', desc: 'Access AI-generated notes, smart study plans, and curated content.', icon: '📚', color: '#00d4ff' },
  { title: 'Practice', desc: 'Take daily AI mock tests, track performance, and compete on leaderboards.', icon: '🎯', color: '#a855f7' },
  { title: 'Earn', desc: 'Win coins, streak rewards, and weekly cash prizes for your performance.', icon: '💰', color: '#22d3ee' },
  { title: 'Grow', desc: 'Get AI career guidance, internships, and build your professional profile.', icon: '🚀', color: '#10b981' },
];

export default function KnowledgeSection() {
  return (
    <section className="knowledge-section-f" id="knowledge">
      <div className="container-f">
        <motion.div className="section-header-f" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <span className="section-tag-f">⚡ Knowledge Pays Off</span>
          <h2 className="section-title-f">
            Your journey from
            <span className="gradient-text"> student to achiever</span>
          </h2>
          <p className="section-sub-f">Every step you take on Vidyajaya brings you closer to your goals — and rewards you along the way.</p>
        </motion.div>

        <div className="knowledge-flow">
          <div className="flow-line" />
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="flow-step"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className="flow-node" style={{ '--node-color': s.color }}>
                <span className="flow-icon">{s.icon}</span>
                <div className="flow-pulse" style={{ borderColor: s.color }} />
              </div>
              <h3 className="flow-title" style={{ color: s.color }}>{s.title}</h3>
              <p className="flow-desc">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
