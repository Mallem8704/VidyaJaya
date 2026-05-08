import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import HeroSection from './landing/HeroSection';
import TrustSection from './landing/TrustSection';
import FeaturesSection from './landing/FeaturesSection';
import KnowledgeSection from './landing/KnowledgeSection';
import DashboardShowcase from './landing/DashboardShowcase';
import CommunitySection from './landing/CommunitySection';
import ReferralSection from './landing/ReferralSection';
import CTASection from './landing/CTASection';
import FooterSection from './landing/FooterSection';
import './Landing.css';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const cursorRef = useRef(null);

  // SEO
  useEffect(() => {
    document.title = "Vidyajaya — Where Knowledge Pays Off | AI-Powered Student Platform";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "India's AI-powered student ecosystem helping students learn smarter, grow faster, and earn through knowledge. AI mock tests, career guidance, and rewards.");
  }, []);

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    return () => { lenis.destroy(); };
  }, []);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Interactive spotlight cursor
  useEffect(() => {
    const handleMouse = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Dark body
  useEffect(() => {
    document.body.classList.add('landing-dark-mode');
    return () => document.body.classList.remove('landing-dark-mode');
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  };

  return (
    <div className="landing-futuristic">
      <div className="cursor-spotlight" />

      {/* NAVBAR */}
      <nav className={`nav-f ${isScrolled ? 'nav-scrolled' : ''}`}>
        <div className="container-f nav-inner-f">
          <div className="nav-logo-f">
            <div className="nav-logo-icon-f">
              <img src="/logo.png" alt="VidyaJaya" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span className="nav-brand-f">Vidya<span>Jaya</span></span>
          </div>

          <div className="nav-links-f">
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('dashboard')}>Dashboard</button>
            <button onClick={() => scrollTo('community')}>Community</button>
            <button onClick={() => scrollTo('referral')}>Rewards</button>
          </div>

          <div className="nav-right-f">
            <Link to="/login" className="nav-login-f">Log In</Link>
            <button className="btn-glow-primary btn-sm-f" onClick={() => navigate('/signup')}>
              Get Started
              <span className="btn-shine" />
            </button>
          </div>

          <button className="hamburger-f" onClick={() => setMobileMenu(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div className="mobile-menu-f" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }}>
            <button className="mobile-close" onClick={() => setMobileMenu(false)}><X size={24} /></button>
            <button className="mobile-link-f" onClick={() => scrollTo('features')}>Features</button>
            <button className="mobile-link-f" onClick={() => scrollTo('dashboard')}>Dashboard</button>
            <button className="mobile-link-f" onClick={() => scrollTo('community')}>Community</button>
            <button className="mobile-link-f" onClick={() => scrollTo('referral')}>Rewards</button>
            <button className="btn-glow-primary" style={{ width: '100%', marginTop: 16 }} onClick={() => { setMobileMenu(false); navigate('/signup'); }}>Get Started Free</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTIONS */}
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <KnowledgeSection />
      <DashboardShowcase />
      <CommunitySection />
      <ReferralSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
