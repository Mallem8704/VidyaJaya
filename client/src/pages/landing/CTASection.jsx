import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="cta-section-f" id="cta">
      <div className="cta-canvas">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0, 3] }}>
            <Stars radius={50} depth={30} count={800} factor={3} fade speed={0.5} />
          </Canvas>
        </Suspense>
      </div>
      <div className="cta-gradient-overlay" />

      <div className="container-f" style={{ position: 'relative', zIndex: 2 }}>
        <motion.div className="cta-content-f" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <h2 className="cta-title-f">
            Join the Future of
            <br />
            <span className="gradient-text">AI Education</span>
          </h2>
          <p className="cta-sub-f">Start your journey today. Learn smarter, earn through knowledge, and be part of India's most ambitious student community.</p>
          <div className="cta-btns-f">
            <button className="btn-glow-primary btn-xl" onClick={() => navigate('/signup')}>
              Start Learning Free
              <span className="btn-shine" />
            </button>
            <a href="https://t.me/vidyajayaa" target="_blank" rel="noopener noreferrer" className="btn-glow-ghost btn-xl">
              Join Community
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
