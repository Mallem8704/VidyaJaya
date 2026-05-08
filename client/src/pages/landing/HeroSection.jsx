import React, { useRef, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function FloatingParticles() {
  const mesh = useRef();
  const count = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#00d4ff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function Scene() {
  return (
    <>
      <Stars radius={100} depth={50} count={1500} factor={4} fade speed={1} />
      <FloatingParticles />
      <ambientLight intensity={0.1} />
    </>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const stats = [
  { value: '50K+', label: 'Active Students' },
  { value: '12+', label: 'AI Tools' },
  { value: '1M+', label: 'Tests Completed' },
  { value: '95%', label: 'Success Rate' },
];

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="hero-futuristic" id="hero">
      <div className="hero-canvas-wrap">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }} style={{ position: 'absolute', inset: 0 }}>
            <Scene />
          </Canvas>
        </Suspense>
      </div>

      <div className="hero-gradient-mesh" />

      <div className="hero-content-f">
        <motion.div className="hero-left-f" initial="hidden" animate="visible">
          <motion.div className="hero-badge-f" custom={0} variants={fadeUp}>
            <span className="badge-dot" />
            <span>Powered by AI · Built for Students</span>
          </motion.div>

          <motion.h1 className="hero-title-f" custom={1} variants={fadeUp}>
            Learn Smarter.
            <br />
            <span className="gradient-text">Earn Through Knowledge.</span>
          </motion.h1>

          <motion.p className="hero-sub-f" custom={2} variants={fadeUp}>
            India's AI-powered student ecosystem helping students learn smarter, grow faster, and earn through knowledge.
          </motion.p>

          <motion.div className="hero-ctas-f" custom={3} variants={fadeUp}>
            <button className="btn-glow-primary" onClick={() => navigate('/signup')}>
              Start Free
              <span className="btn-shine" />
            </button>
            <button className="btn-glow-ghost" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore AI Tools
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </motion.div>

          <motion.div className="hero-stats-f" custom={4} variants={fadeUp}>
            {stats.map((s, i) => (
              <div key={i} className="stat-card-f">
                <div className="stat-val-f">{s.value}</div>
                <div className="stat-lbl-f">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="hero-right-f" initial={{ opacity: 0, x: 60, rotateY: -10 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} transition={{ duration: 1, delay: 0.5 }}>
          <div className="dashboard-mockup-f">
            <div className="mockup-header-f">
              <div className="mockup-dots"><span /><span /><span /></div>
              <span className="mockup-title-bar">Vidyajaya AI Dashboard</span>
            </div>
            <div className="mockup-body-f">
              <div className="mockup-row">
                <div className="mini-card-f accent-blue">
                  <div className="mc-val">87%</div>
                  <div className="mc-lbl">Accuracy</div>
                  <div className="mc-bar"><div className="mc-fill" style={{ width: '87%' }} /></div>
                </div>
                <div className="mini-card-f accent-purple">
                  <div className="mc-val">142</div>
                  <div className="mc-lbl">Tests Done</div>
                  <div className="mc-bar"><div className="mc-fill" style={{ width: '72%' }} /></div>
                </div>
              </div>
              <div className="mockup-row">
                <div className="mini-card-f accent-cyan wide">
                  <div className="mc-lbl">AI Recommendation</div>
                  <div className="mc-rec">Focus on Polity Ch.4 — your weakest area this week</div>
                </div>
              </div>
              <div className="mockup-row">
                <div className="mini-card-f accent-gold">
                  <div className="mc-val">🔥 24</div>
                  <div className="mc-lbl">Day Streak</div>
                </div>
                <div className="mini-card-f accent-green">
                  <div className="mc-val">#3</div>
                  <div className="mc-lbl">Rank</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
