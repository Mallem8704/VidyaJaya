import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const features = [
  { title: 'AI Notes Generator', desc: 'Generate comprehensive study notes from any topic using GPT-4o. Tailored to your exam syllabus.', icon: '📄', color: '#00d4ff' },
  { title: 'Smart Mock Tests', desc: 'AI-generated fresh questions daily. Never repeat. Mapped to real exam patterns.', icon: '🧠', color: '#a855f7' },
  { title: 'AI Career Guidance', desc: 'Personalized career roadmap based on your strengths, interests, and exam performance.', icon: '🎯', color: '#06b6d4' },
  { title: 'AI Resume Builder', desc: 'Create professional resumes optimized for your target career in minutes.', icon: '📋', color: '#22d3ee' },
  { title: 'Productivity Tracking', desc: 'Track study hours, streak days, and improvement trends with beautiful analytics.', icon: '📊', color: '#f59e0b' },
  { title: 'Student Rewards', desc: 'Earn coins for every test, streak milestone, and referral. Redeem for cash rewards.', icon: '🏆', color: '#10b981' },
  { title: 'Internship Opportunities', desc: 'Access curated internships from top companies matched to your skills.', icon: '💼', color: '#ec4899' },
];

function TiltCard({ children, index }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 12;
    const rotateY = (centerX - x) / 12;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="feature-card-f"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
    >
      {children}
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section className="features-section-f" id="features">
      <div className="container-f">
        <motion.div className="section-header-f" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <span className="section-tag-f">✦ AI-Powered Features</span>
          <h2 className="section-title-f">
            Everything you need to
            <span className="gradient-text"> learn, grow & earn</span>
          </h2>
          <p className="section-sub-f">Cutting-edge AI tools designed to transform how students prepare, compete, and succeed.</p>
        </motion.div>

        <div className="features-grid-f">
          {features.map((f, i) => (
            <TiltCard key={i} index={i}>
              <div className="feat-glow" style={{ background: f.color }} />
              <div className="feat-icon-f" style={{ '--accent': f.color }}>{f.icon}</div>
              <h3 className="feat-title-f">{f.title}</h3>
              <p className="feat-desc-f">{f.desc}</p>
              <div className="feat-border-glow" style={{ '--accent': f.color }} />
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
