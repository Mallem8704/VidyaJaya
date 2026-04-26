import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { 
  TrendingUp, Trophy, Coins, Rocket, Star, Target, 
  Hand, Flame, Play, CheckCircle, ShieldCheck, 
  Bot, BarChart, HelpCircle, History, Landmark, 
  Newspaper, Map, Scale, BookOpen, Clock, Shield,
  ArrowRight, Search, Menu, X, Mail, Instagram, 
  Youtube, Linkedin, Send 
} from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [typeWriterText, setTypeWriterText] = useState('Crack UPSC 2026');

  // SEO hook
  useEffect(() => {
    document.title = "Vidyajaya — India's #1 AI Exam Platform for UPSC, SSC & Banking";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Vidyajaya is India's leading student platform providing AI-powered study materials, daily mock tests, job updates, and career guidance for UPSC, SSC, Banking, and RRB exams.");
    }
  }, []);

  // Scroll Listener hook
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer hook
  useEffect(() => {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
    return () => revealObs.disconnect();
  }, []);

  // Typewriter hook
  useEffect(() => {
    const lines = ['Crack UPSC 2026', 'Score 99 in SSC CGL', 'Ace RRB NTPC', 'Master Daily Tests', 'Win Weekly Rewards'];
    let li = 0;
    let ci = 0;
    let deleting = false;
    let timeout;
    
    const typeWriter = () => {
      const full = lines[li];
      if (!deleting) {
        setTypeWriterText(full.slice(0, ci + 1));
        ci++;
        if (ci === full.length) {
          deleting = true;
          timeout = setTimeout(typeWriter, 1600);
          return;
        }
      } else {
        setTypeWriterText(full.slice(0, ci - 1));
        ci--;
        if (ci === 0) {
          deleting = false;
          li = (li + 1) % lines.length;
          timeout = setTimeout(typeWriter, 400);
          return;
        }
      }
      timeout = setTimeout(typeWriter, deleting ? 42 : 72);
    };
    timeout = setTimeout(typeWriter, 1200);
    return () => clearTimeout(timeout);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsMobileMenuOpen(false);
  };

  const handleCtaClick = () => {
    navigate('/signup');
  };

  return (
    <div className="landing-page">
      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-inner">
          <span className="ticker-item"><TrendingUp size={14} className="text-secondary" /> <span>Priya from Delhi</span> scored 94% in UPSC Mock #47</span>
          <span className="ticker-item"><Trophy size={14} className="text-accent-gold" /> <span>Rahul from Mumbai</span> unlocked Gold Badge — 30 day streak!</span>
          <span className="ticker-item"><Coins size={14} className="text-accent-gold" /> <span>SSC student</span> earned ₹500 in weekly reward pool</span>
          <span className="ticker-item"><Rocket size={14} className="text-primary" /> <span>12,483 students</span> active on VidyaJaya right now</span>
          <span className="ticker-item"><Star size={14} className="text-accent-gold" fill="currentColor" /> <span>Sneha from Hyderabad</span> cleared SBI PO with 99 marks</span>
          <span className="ticker-item"><Target size={14} className="text-secondary" /> <span>VidyaJaya AI</span> generated 180 fresh questions today</span>
          <span className="ticker-item"><TrendingUp size={14} className="text-secondary" /> <span>Priya from Delhi</span> scored 94% in UPSC Mock #47</span>
          <span className="ticker-item"><Trophy size={14} className="text-accent-gold" /> <span>Rahul from Mumbai</span> unlocked Gold Badge — 30 day streak!</span>
          <span className="ticker-item"><Coins size={14} className="text-accent-gold" /> <span>SSC student</span> earned ₹500 in weekly reward pool</span>
          <span className="ticker-item"><Rocket size={14} className="text-primary" /> <span>12,483 students</span> active on VidyaJaya right now</span>
          <span className="ticker-item"><Star size={14} className="text-accent-gold" fill="currentColor" /> <span>Sneha from Hyderabad</span> cleared SBI PO with 99 marks</span>
          <span className="ticker-item"><Target size={14} className="text-secondary" /> <span>VidyaJaya AI</span> generated 180 fresh questions today</span>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="nav-inner">
          <div className="nav-logo">
            <div className="nav-logo-icon">
              <img src="/logo.png" alt="VidyaJaya Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span className="nav-brand">Vidya<span>Jaya</span></span>
          </div>
          
          <div className="nav-links">
            <button className="nav-link" onClick={() => scrollToSection('features')}>Features</button>
            <button className="nav-link" onClick={() => scrollToSection('how')}>How It Works</button>
            <button className="nav-link" onClick={() => scrollToSection('pricing')}>Pricing</button>
            <button className="nav-link" onClick={() => scrollToSection('leaderboard-section')}>Leaderboard</button>
          </div>

          <div className="nav-right">
            <button className="theme-btn" onClick={toggleTheme} title="Toggle dark mode" aria-label="Toggle dark mode">
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              )}
            </button>
            <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
            <button onClick={handleCtaClick} className="btn btn-primary btn-sm pulse-glow">Get Early Access</button>
          </div>

          <button className="hamburger" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: 'var(--text)' }} onClick={() => setIsMobileMenuOpen(false)}>✕</button>
        <button className="mobile-link" onClick={() => scrollToSection('features')}>Features</button>
        <button className="mobile-link" onClick={() => scrollToSection('how')}>How It Works</button>
        <button className="mobile-link" onClick={() => scrollToSection('pricing')}>Pricing</button>
        <button className="mobile-link" onClick={() => scrollToSection('leaderboard-section')}>Leaderboard</button>
        
        <div className="theme-toggle-row">
          <span style={{ fontWeight: 600 }}>Dark Mode</span>
          <button className="theme-btn" onClick={toggleTheme} title="Toggle dark mode" aria-label="Toggle dark mode">
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            )}
          </button>
        </div>

        <button onClick={() => { setIsMobileMenuOpen(false); handleCtaClick(); }} className="btn btn-primary btn-lg" style={{ marginTop: '16px', justifyContent: 'center' }}>
          <Flame size={20} /> Start for Free
        </button>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid-bg"></div>
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
        </div>
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge-row">
              <div className="hero-badge">India's #1 AI Exam Platform</div>
            </div>
            <h1 className="hero-title">
              Turn Study Into<br />
              Ranks & Rewards
            </h1>
            <p className="hero-sub">AI-powered daily mock tests, live leaderboards, and real cash rewards for UPSC, SSC, Banking and more. Every question fresh. Every day a new competition.</p>
            <p className="hero-mobile-text">Daily mock tests + real rewards</p>
            
            <div className="hero-pills">
              <div className="hero-pill"><div className="dot" style={{ background: '#FF6B00' }}></div>AI-generated daily mock tests across UPSC, SSC, Banking, RRB and more – never the same question twice.</div>
              <div className="hero-pill"><div className="dot" style={{ background: '#FFD700' }}></div>Live leaderboard that ranks you against serious aspirants across India in real time.</div>
              <div className="hero-pill"><div className="dot" style={{ background: '#00C853' }}></div>Weekly cash rewards and streak bonuses for top performers – pure skill, no gambling.</div>
            </div>

            <div className="hero-ctas">
              <button onClick={handleCtaClick} className="btn btn-primary btn-lg pulse-glow">
                Start Free Test
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => scrollToSection('leaderboard-section')}>View Leaderboard</button>
            </div>
            <div className="hero-trust">
              <span className="stars">★★★★★</span>
              <span>2.5L+ students registered · 5L+ tests completed · 94% report improved scores · ₹0 to start, cancel anytime</span>
            </div>
            <div className="hero-stats">
              <div><div className="hero-stat-n">2.5L+</div><div className="hero-stat-l">STUDENTS</div></div>
              <div><div className="hero-stat-n">5L+</div><div className="hero-stat-l">TESTS COMPLETED</div></div>
              <div><div className="hero-stat-n">94%</div><div className="hero-stat-l">IMPROVED SCORES</div></div>
              <div><div className="hero-stat-n">₹0</div><div className="hero-stat-l">TO START</div></div>
            </div>
          </div>
          <div className="hero-right mockup-wrap">
            <div className="float-badge float-badge-1">
              <div className="fb-icon" style={{ background: 'rgba(255,215,0,.15)', color: '#FFD700' }}><Coins size={20} /></div>
              <div><div className="fb-title">+25 Coins Earned!</div><div className="fb-sub">Just now</div></div>
            </div>
            <div className="float-badge float-badge-2">
              <div className="fb-icon" style={{ background: 'rgba(0,200,83,.15)', color: '#00C853' }}><Trophy size={20} /></div>
              <div><div className="fb-title">New Badge Unlocked!</div><div className="fb-sub">Week Warrior</div></div>
            </div>
            <div className="mockup-card">
              <div className="mockup-header">
                <div className="mockup-greeting">Good morning <Hand size={16} className="inline text-accent-gold" /></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="mockup-name">Dheeraj Royal</div>
                  <div style={{ background: 'rgba(255,107,0,.2)', border: '1px solid rgba(255,107,0,.3)', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', fontWeight: 700, color: '#ff9350', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Coins size={12} /> 340
                  </div>
                </div>
                <div className="mockup-streak">
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,.7)', letterSpacing: '1px', marginBottom: '2px' }}>STREAK</div>
                    <div className="streak-txt">12 Day Streak!</div>
                  </div>
                  <div className="streak-fire"><Flame size={24} fill="currentColor" /></div>
                </div>
              </div>
              <div className="mockup-body">
                <div className="mockup-test-card">
                  <div className="mct-label">TODAY'S CHALLENGE</div>
                  <div className="mct-title">UPSC Daily Mock Test</div>
                  <button className="mct-btn">▶ Start — 30 Qs</button>
                </div>
                <div className="mockup-stats">
                  <div className="ms"><div className="ms-n" style={{ color: '#3B82F6' }}>87%</div><div className="ms-l">Accuracy</div></div>
                  <div className="ms"><div className="ms-n" style={{ color: '#00C853' }}>48</div><div className="ms-l">Tests</div></div>
                  <div className="ms"><div className="ms-n" style={{ color: '#FF6B00' }}>#3</div><div className="ms-l">Rank</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="container text-center">
          <div className="section-tag reveal">✦ Platform Features</div>
          <h2 className="section-title reveal reveal-delay-1">The only <span style={{ color: 'var(--orange)' }}>Vidyajaya platform</span> feature<br />that actually pays you to study</h2>
          <p className="section-sub reveal reveal-delay-2">Built for UPSC, SSC, Banking, RRB, and aptitude exams. Vidyajaya uses AI to generate fresh questions every night, runs daily contests with live leaderboards, and rewards your performance with coins and weekly cash payouts.</p>
          <div className="features-grid" style={{ marginTop: '56px' }}>
            <div className="card feat-card feat-card-1 reveal">
              <div className="feat-icon" style={{ background: 'rgba(255,107,0,.12)', color: 'var(--orange)' }}><Bot size={32} /></div>
              <div className="feat-title">AI Daily Questions</div>
              <div className="feat-desc">GPT‑4o generates fresh questions every midnight across UPSC, SSC, Banking, RRB and more – mapped to real exam patterns and the latest current affairs. No recycled question bank.</div>
            </div>
            <div className="card feat-card feat-card-2 reveal reveal-delay-1">
              <div className="feat-icon" style={{ background: 'rgba(0,200,83,.12)', color: '#00C853' }}><Flame size={32} fill="currentColor" /></div>
              <div className="feat-title">Daily Streak & Coins</div>
              <div className="feat-desc">Build your streak, earn coins for every test and milestone, and redeem them for streak freezes, Pro access, and cash rewards. Your consistency finally has a score.</div>
            </div>
            <div className="card feat-card feat-card-3 reveal reveal-delay-2">
              <div className="feat-icon" style={{ background: 'rgba(124,58,237,.12)', color: '#7C3AED' }}><Trophy size={32} /></div>
              <div className="feat-title">Live Leaderboard</div>
              <div className="feat-desc">Compete with serious aspirants across India on a transparent leaderboard. Top performers win from a weekly and monthly reward pool funded from subscriptions, not betting.</div>
            </div>
            <div className="card feat-card feat-card-4 reveal">
              <div className="feat-icon" style={{ background: 'rgba(14,165,233,.12)', color: '#0EA5E9' }}><BarChart size={32} /></div>
              <div className="feat-title">AI Performance Analysis</div>
              <div className="feat-desc">After every test, AI highlights your exact weak chapters and question types and suggests what to study in the next 7 days. No generic “60% accuracy” reports.</div>
            </div>
            <div className="card feat-card feat-card-5 reveal reveal-delay-1">
              <div className="feat-icon" style={{ background: 'rgba(245,158,11,.12)', color: '#F59E0B' }}><HelpCircle size={32} /></div>
              <div className="feat-title">AI Doubt Solver</div>
              <div className="feat-desc">Upload any question as image or text. Get a step-by-step explanation within seconds. Available 24/7. No waiting for a teacher to respond.</div>
            </div>
            <div className="card feat-card feat-card-6 reveal reveal-delay-2">
              <div className="feat-icon" style={{ background: 'rgba(239,68,68,.12)', color: '#EF4444' }}><Coins size={32} /></div>
              <div className="feat-title">Coin Rewards System</div>
              <div className="feat-desc">Earn coins for every test, every streak milestone, every referral. Redeem coins for streak freezes, premium access, or weekly cash payouts.</div>
            </div>
          </div>

          <div className="features-grid-mobile">
            {[
              { icon: Bot, title: 'AI Mock Tests', desc: 'Fresh questions daily', color: '#FF6B00', bg: 'rgba(255,107,0,.1)' },
              { icon: Trophy, title: 'Leaderboard', desc: 'Compete nationwide', color: '#7C3AED', bg: 'rgba(124,58,237,.1)' },
              { icon: Coins, title: 'Rewards', desc: 'Earn based on rank', color: '#00C853', bg: 'rgba(0,200,83,.1)' }
            ].map((f, i) => (
              <div key={i} className="feature-item-mobile reveal">
                <div className="feature-icon-mobile" style={{ background: f.bg, color: f.color }}>
                  <f.icon size={20} />
                </div>
                <div className="feature-content-mobile">
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="trust-mobile reveal">
            <div className="trust-mobile-item">
              <span className="trust-mobile-val">1,200+</span>
              <span className="trust-mobile-lbl">Students attempted today</span>
            </div>
            <div className="trust-mobile-item">
              <span className="trust-mobile-val">₹2,500</span>
              <span className="trust-mobile-lbl">Rewards distributed today</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <div className="container text-center">
          <div className="section-tag reveal">⚡ Simple Process</div>
          <h2 className="section-title reveal reveal-delay-1">Three steps to <span style={{ color: 'var(--orange)' }}>transform your prep</span></h2>
          <p className="section-sub reveal reveal-delay-2">No complicated setup. No credit card. Start your first test in under 2 minutes.</p>
          <div className="steps-row">
            <div className="step reveal">
              <div className="step-num" style={{ background: '#FF6B00' }}>01</div>
              <div className="step-content">
                <h3 className="step-title">Create Free Account</h3>
                <p className="step-desc">Sign up with email in 30 seconds.</p>
              </div>
            </div>
            <div className="step reveal">
              <div className="step-num" style={{ background: '#00C853' }}>02</div>
              <div className="step-content">
                <h3 className="step-title">Take Daily AI Tests</h3>
                <p className="step-desc">Fresh questions waiting at 9 AM.</p>
              </div>
            </div>
            <div className="step reveal">
              <div className="step-num" style={{ background: '#7C3AED' }}>03</div>
              <div className="step-content">
                <h3 className="step-title">Build Streak and Earn</h3>
                <p className="step-desc">Climb the leaderboard for Sunday rewards.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section reveal">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item"><div className="stat-num count-up">2.5L+</div><div className="stat-lbl">Students Registered</div></div>
            <div className="stat-item"><div className="stat-num count-up">5L+</div><div className="stat-lbl">Tests Completed</div></div>
            <div className="stat-item"><div className="stat-num">94%</div><div className="stat-lbl">Report Improved Scores</div></div>
            <div className="stat-item"><div className="stat-num">150+</div><div className="stat-lbl">Test Categories</div></div>
          </div>
        </div>
      </section>

      {/* LEADERBOARD */}
      <section className="leaderboard-section" id="leaderboard-section">
        <div className="container text-center">
          <div className="section-tag reveal"><Trophy size={14} className="inline mr-1" /> Live Rankings</div>
          <h2 className="section-title reveal reveal-delay-1">This Week's <span style={{ color: 'var(--orange)' }}>Champions</span></h2>
          <p className="section-sub reveal reveal-delay-2">Top 3 win ₹500, ₹250 and ₹100 every Sunday midnight. Your rank updates in real-time.</p>
          <div className="lb-card reveal">
            <div className="lb-head">
              <div className="lb-head-title"><Trophy size={18} className="inline mr-2 text-accent-gold" /> Weekly Leaderboard</div>
              <div className="badge badge-green" style={{ fontSize: '11px' }}>● Live</div>
            </div>
            <div className="lb-row">
              <div className="lb-medal"><Trophy size={20} className="text-accent-gold" /></div>
              <div className="lb-ava" style={{ background: 'linear-gradient(135deg, #FF6B00, #FF3D00)' }}>RK</div>
              <div><div className="lb-name">Rahul Kumar</div><div className="lb-exam">UPSC · 🔥 28 streak</div></div>
              <div><div className="lb-pts">2,840</div><div className="lb-streak">+₹500 this Sunday</div></div>
            </div>
            <div className="lb-row">
              <div className="lb-medal"><Trophy size={20} className="text-gray-400" /></div>
              <div className="lb-ava" style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)' }}>PS</div>
              <div><div className="lb-name">Priya Sharma</div><div className="lb-exam">SSC · 🔥 21 streak</div></div>
              <div><div className="lb-pts">2,680</div><div className="lb-streak">+₹250 this Sunday</div></div>
            </div>
            <div className="lb-row">
              <div className="lb-medal"><Trophy size={20} className="text-orange-400" /></div>
              <div className="lb-ava" style={{ background: 'linear-gradient(135deg, #00C853, #0891B2)' }}>SM</div>
              <div><div className="lb-name">Sneha Misra</div><div className="lb-exam">Banking · 🔥 19 streak</div></div>
              <div><div className="lb-pts">2,540</div><div className="lb-streak">+₹100 this Sunday</div></div>
            </div>
            <div className="lb-row you">
              <div className="lb-medal" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--orange)' }}>#342</div>
              <div className="lb-ava" style={{ background: 'var(--orange)' }}>DR</div>
              <div><div className="lb-name" style={{ color: 'var(--orange)' }}>You — Dheeraj Royal</div><div className="lb-exam">UPSC · 🔥 12 streak</div></div>
              <div><div className="lb-pts" style={{ color: '#fff' }}>1,940</div><div className="lb-streak">45 pts to reach #341</div></div>
            </div>
            <div style={{ padding: '16px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,.06)' }}>
              <button onClick={handleCtaClick} className="btn btn-primary btn-sm">Join and Compete →</button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="container text-center">
          <div className="section-tag reveal">💬 Student Stories</div>
          <h2 className="section-title reveal reveal-delay-1">Real students. <span style={{ color: 'var(--orange)' }}>Real results.</span></h2>
        </div>
        <div className="testi-scroll" style={{ marginTop: '48px' }}>
          <div className="testi-track" id="testi-track">
            <div className="testi-card"><div className="testi-stars">★★★★★</div><p className="testi-quote">"VidyaJaya's AI analysis told me exactly which Polity chapters I was weak in. Focused on those for 2 weeks and cleared UPSC Prelims in my first attempt."</p><div className="testi-author"><div className="testi-ava" style={{ background: 'linear-gradient(135deg,#FF6B00,#FF3D00)' }}>PS</div><div><div className="testi-name">Priya Sharma</div><div className="testi-exam">UPSC 2024 — Cleared</div></div></div></div>
            <div className="testi-card"><div className="testi-stars">★★★★★</div><p className="testi-quote">"The daily streak kept me consistent for 180 days straight. I scored 99 marks in SSC CGL Tier-1. The leaderboard competition motivated me to study even on difficult days."</p><div className="testi-author"><div className="testi-ava" style={{ background: 'linear-gradient(135deg,#3B82F6,#7C3AED)' }}>RK</div><div><div className="testi-name">Rahul Kumar</div><div className="testi-exam">SSC CGL — 99 Marks</div></div></div></div>
            <div className="testi-card"><div className="testi-stars">★★★★★</div><p className="testi-quote">"I was failing Banking exams repeatedly. VidyaJaya showed me my accuracy in Quant was only 42%. Practiced specific weak chapters for 3 weeks. Got selected in SBI PO."</p><div className="testi-author"><div className="testi-ava" style={{ background: 'linear-gradient(135deg,#00C853,#0891B2)' }}>SP</div><div><div className="testi-name">Sneha Patel</div><div className="testi-exam">SBI PO — Selected</div></div></div></div>
            
            <div className="testi-card"><div className="testi-stars">★★★★★</div><p className="testi-quote">"VidyaJaya's AI analysis told me exactly which Polity chapters I was weak in. Focused on those for 2 weeks and cleared UPSC Prelims in my first attempt."</p><div className="testi-author"><div className="testi-ava" style={{ background: 'linear-gradient(135deg,#FF6B00,#FF3D00)' }}>PS</div><div><div className="testi-name">Priya Sharma</div><div className="testi-exam">UPSC 2024 — Cleared</div></div></div></div>
            <div className="testi-card"><div className="testi-stars">★★★★★</div><p className="testi-quote">"The daily streak kept me consistent for 180 days straight. I scored 99 marks in SSC CGL Tier-1. The leaderboard competition motivated me to study even on difficult days."</p><div className="testi-author"><div className="testi-ava" style={{ background: 'linear-gradient(135deg,#3B82F6,#7C3AED)' }}>RK</div><div><div className="testi-name">Rahul Kumar</div><div className="testi-exam">SSC CGL — 99 Marks</div></div></div></div>
            <div className="testi-card"><div className="testi-stars">★★★★★</div><p className="testi-quote">"I was failing Banking exams repeatedly. VidyaJaya showed me my accuracy in Quant was only 42%. Practiced specific weak chapters for 3 weeks. Got selected in SBI PO."</p><div className="testi-author"><div className="testi-ava" style={{ background: 'linear-gradient(135deg,#00C853,#0891B2)' }}>SP</div><div><div className="testi-name">Sneha Patel</div><div className="testi-exam">SBI PO — Selected</div></div></div></div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="container text-center">
          <div className="section-tag reveal">💳 Simple Pricing</div>
          <h2 className="section-title reveal reveal-delay-1">Start free. <span style={{ color: 'var(--orange)' }}>Upgrade when ready.</span></h2>
          <p className="section-sub reveal reveal-delay-2">No hidden fees. Cancel anytime. Students on free plan can still build streaks and view the leaderboard.</p>
          
          <div className="pricing-toggle reveal reveal-delay-3">
            <span className={`toggle-lbl ${!isAnnual ? 'active' : ''}`} id="lbl-monthly">Monthly</span>
            <div className={`toggle-track ${isAnnual ? 'on' : ''}`} onClick={() => setIsAnnual(!isAnnual)}><div className="toggle-thumb"></div></div>
            <span className={`toggle-lbl ${isAnnual ? 'active' : ''}`} id="lbl-annual">Annual</span>
            <span className="save-badge" style={{ opacity: isAnnual ? 1 : 0 }}>Save 30%!</span>
          </div>

          <div className="pricing-grid reveal">
            <div className="price-card">
              <div className="price-name">Free</div>
              <div className="price-amount">₹0 <span>/ forever</span></div>
              <div className="price-desc">Perfect to start your streak and experience VidyaJaya. Take limited tests, track your streak, and see the leaderboard – but only Pro users are eligible for cash rewards.</div>
              <div className="price-features">
                <div className="pf yes"><div className="pf-check">✓</div><span>5 tests per week</span></div>
                <div className="pf yes"><div className="pf-check">✓</div><span>Daily current affairs (10 Qs)</span></div>
                <div className="pf yes"><div className="pf-check">✓</div><span>Daily streak tracking</span></div>
                <div className="pf yes"><div className="pf-check">✓</div><span>View-only leaderboard</span></div>
                <div className="pf no"><div className="pf-check">✗</div><span>AI performance analysis</span></div>
                <div className="pf no"><div className="pf-check">✗</div><span>Coin earning & rewards</span></div>
              </div>
              <button onClick={handleCtaClick} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Start Free — No Card</button>
            </div>

            <div className="price-card">
              <div className="price-name">PRO Weekly</div>
              <div className="price-amount"><sup>₹</sup>49 <span>/ week</span></div>
              <div className="price-desc">Perfect for quick exam revision. Unlock leaderboards, AI performance analytics, and double rewards for a full week.</div>
              <div className="price-features">
                <div className="pf yes"><div className="pf-check">✓</div><span>Unlock PRO Leaderboard</span></div>
                <div className="pf yes"><div className="pf-check">✓</div><span>AI Performance Analytics</span></div>
                <div className="pf yes"><div className="pf-check">✓</div><span>Double Reward Coins</span></div>
                <div className="pf yes"><div className="pf-check">✓</div><span>Unlimited AI Doubts</span></div>
                <div className="pf yes"><div className="pf-check">✓</div><span>UPSC, SSC & Banking Tests</span></div>
                <div className="pf yes"><div className="pf-check">✓</div><span>Premium 'PRO' Badge</span></div>
              </div>
              <button onClick={handleCtaClick} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Get PRO Weekly</button>
            </div>

            <div className="price-card popular">
              <div className="popular-badge">BEST VALUE</div>
              <div className="price-name" style={{ color: 'var(--orange)' }}>PRO Monthly</div>
              <div className="price-amount"><sup>₹</sup>99 <span>/ month</span></div>
              <div className="price-desc">Best for serious UPSC aspirants. Everything in Weekly, plus eligibility for cash rewards, 3x coin multipliers, and priority support.</div>
              <div className="price-features">
                <div className="pf yes"><div className="pf-check">✓</div><span>All Weekly Features</span></div>
                <div className="pf yes"><div className="pf-check">✓</div><span>Eligible for Cash Rewards</span></div>
                <div className="pf yes"><div className="pf-check">✓</div><span>3x Coins on Daily Streaks</span></div>
                <div className="pf yes"><div className="pf-check">✓</div><span>Monthly Performance Report</span></div>
                <div className="pf yes"><div className="pf-check">✓</div><span>Early Access to Mock Tests</span></div>
                <div className="pf yes"><div className="pf-check">✓</div><span>Priority Admin Support</span></div>
              </div>
              <button onClick={handleCtaClick} className="btn btn-primary pulse-glow" style={{ width: '100%', justifyContent: 'center' }}>Get PRO Monthly →</button>
            </div>
          </div>
          <p className="pricing-disclaimer" style={{ marginTop: '40px', fontSize: '14px', color: 'rgba(255,255,255,.6)', maxWidth: '800px', margin: '40px auto 0' }}>
            VidyaJaya is a skill‑based subscription platform. You pay for access to tests and analytics; rewards are performance bonuses from our subscription revenue – not gambling or betting.
          </p>
        </div>
      </section>
      
      {/* EXAM CATEGORIES */}
      <section className="exams-section">
        <div className="container text-center">
          <div className="section-tag reveal"><BookOpen size={14} className="inline mr-1" /> All Exams Covered</div>
          <h2 className="section-title reveal reveal-delay-1">The best <span style={{ color: 'var(--orange)' }}>Vidyajaya app</span> for <br />every competitive exam in India</h2>
          <p className="section-sub reveal reveal-delay-2">Vidyajaya covers 6 major exam categories with AI-generated questions tailored to each exam's pattern and syllabus.</p>
          <div className="exam-grid">
            <div className="card exam-card reveal" style={{ '--ec-color': '#FF6B00' }}>
              <div className="exam-icon text-secondary"><Landmark size={32} /></div>
              <div className="exam-name">UPSC Civil Services</div>
              <div className="exam-desc">Prelims, Mains, Current Affairs. AI-generated daily tests mapped to UPSC syllabus. Polity, History, Economy, Science & Tech.</div>
              <div className="exam-meta">
                <span className="exam-tag">Prelims</span><span className="exam-tag">Mains GS</span><span className="exam-tag">Current Affairs</span>
              </div>
            </div>
            <div className="card exam-card reveal reveal-delay-1" style={{ '--ec-color': '#3B82F6' }}>
              <div className="exam-icon text-blue-500"><Newspaper size={32} /></div>
              <div className="exam-name">SSC CGL / CHSL / MTS</div>
              <div className="exam-desc">Speed and accuracy-focused tests. Quantitative Aptitude, English, General Awareness, Reasoning. Tier-I & Tier-II patterns.</div>
              <div className="exam-meta">
                <span className="exam-tag">Tier I</span><span className="exam-tag">Tier II</span><span className="exam-tag">Speed Tests</span>
              </div>
            </div>
            <div className="card exam-card reveal reveal-delay-2" style={{ '--ec-color': '#00C853' }}>
              <div className="exam-icon text-green-500"><Rocket size={32} /></div>
              <div className="exam-name">RRB NTPC / Group D</div>
              <div className="exam-desc">Railway exam preparation with affordable access. CBT-1 and CBT-2 patterns. Mobile-friendly daily practice tests.</div>
            </div>
            <div className="card exam-card reveal reveal-delay-3" style={{ '--ec-color': '#7C3AED' }}>
              <div className="exam-icon text-purple-500"><Shield size={32} /></div>
              <div className="exam-name">Defence Exams (NDA & CDS)</div>
              <div className="exam-desc">Prepare for NDA & CDS with daily AI mock tests. Covers Maths, English, GK, and defence exam patterns.</div>
              <div className="exam-meta">
                <span className="exam-tag">NDA</span><span className="exam-tag">CDS</span><span className="exam-tag">Maths</span><span className="exam-tag">GK</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHATSAPP STRIP */}
      <div className="wa-strip">
        <div className="container">
          <div className="wa-inner">
            <div>
              <div className="wa-text"><Send size={24} className="inline mr-2 text-white" /> Join 12,000+ students on our Telegram community</div>
              <div className="wa-sub">Get daily current affairs, free study notes, and launch updates directly on Telegram</div>
            </div>
            <a href="https://t.me/vidyajayaa" target="_blank" rel="noopener noreferrer" className="wa-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg>
              Join Telegram →
            </a>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="faq-section">
        <div className="container text-center">
          <div className="section-tag reveal">❓ Questions Answered</div>
          <h2 className="section-title reveal reveal-delay-1">Frequently asked <span style={{ color: 'var(--orange)' }}>questions</span></h2>
          <div className="faq-list">
            {[
              { q: "Is VidyaJaya really free? What's the catch?", a: "Yes, the Free plan is genuinely free forever — no credit card required, no hidden trial. You get 5 tests per week, daily current affairs (10 questions), streak tracking, and leaderboard access. The paid Pro plan (starts at ₹49/week) unlocks unlimited tests, AI analysis, coin rewards, and weekly cash prizes. We made the free plan useful enough to start, and the Pro plan valuable enough to upgrade." },
              { q: "How is VidyaJaya different from Testbook or Unacademy?", a: "Three things no other platform does: (1) AI-generated fresh questions every single day using GPT-4o — questions are never recycled. (2) A streak + coin reward system that pays you for consistency — top 3 weekly students win real cash every Sunday. (3) Genuine AI analysis that tells you which specific chapter to study next, not a generic percentage. VidyaJaya is built to be addictive in the best way — you'll want to come back every day." },
              { q: "Are the weekly cash rewards real? How do I receive them?", a: "Yes, 100% real. Every Sunday midnight, the top 3 students on the weekly leaderboard receive ₹500, ₹250, and ₹100 respectively. Rewards are credited as coins first and can be withdrawn to your UPI ID or bank account. To be eligible, you must be on a Pro plan. Free users can view the leaderboard but are not eligible for cash rewards." },
              { q: "What happens if I miss a day and my streak breaks?", a: "Missing a day resets your streak to 0 — this is intentional, it creates urgency and habit. However, Pro users get 2 \"Streak Freeze\" credits per month. Use a freeze on a day you can't study and your streak is protected. You can also earn extra streak freezes by spending coins. We'll send you a reminder notification at 8 PM if you haven't completed a test that day." },
              { q: "When will VidyaJaya launch? How do I get access?", a: "VidyaJaya is in final development and launching very soon. Join the waitlist above with your email and you'll be among the first to get access. The first 1,000 students on the waitlist will receive 3 months of Pro access completely free at launch. Join the Telegram community for real-time launch updates and daily free study content in the meantime." }
            ].map((item, i) => (
              <div key={i} className={`faq-item reveal ${openFaq === i ? 'open' : ''}`} style={{ transitionDelay: `${i * 0.1}s` }}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="faq-q-text">{item.q}</span>
                  <div className="faq-chevron">▾</div>
                </button>
                <div className="faq-a"><div className="faq-a-inner">{item.a}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="founder reveal">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '48px' }}>
            <div className="section-tag" style={{ color: 'rgba(255,107,0,.8)' }}>👤 The Founders</div>
            <h2 style={{ color: '#fff', marginBottom: 0 }}>The visionaries <span style={{ color: 'var(--orange)' }}>behind VidyaJaya</span></h2>
          </div>
          <div className="founders-grid">
            <div className="founder-card reveal">
              <div className="founder-top">
                <div className="founder-ava" style={{ padding: 0, overflow: 'hidden', background: 'none', border: '3px solid rgba(255,107,0,.5)', boxShadow: '0 0 40px rgba(255,107,0,.3)' }}>
                  <img src="/founder-dheeraj.jpg" alt="Mallem Dheeraj Royal" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
                <div className="founder-info">
                  <div className="founder-name">Mallem Dheeraj Royal</div>
                  <div className="founder-role">Founder & CEO</div>
                  <div className="founder-loc"><Map size={14} className="inline mr-1" /> Kadiri, Andhra Pradesh</div>
                </div>
              </div>
              <blockquote className="founder-quote">"I built VidyaJaya because 2.5 crore students in India study every single day and not one platform was rewarding their consistency. Every test you take, every streak you maintain, every question you answer correctly — it counts. It rewards you. It brings you one step closer to the rank you deserve."</blockquote>
              <div className="founder-contacts">
                <div className="fc"><span className="fc-icon"><Mail size={14} /></span><span className="fc-val">dheeraj@vidyajaya.in</span></div>
                <div className="fc"><span className="fc-icon"><Instagram size={14} /></span><span className="fc-val">@mallemdheerajroyal</span></div>
              </div>
            </div>

            <div className="founder-card reveal reveal-delay-2">
              <div className="founder-top">
                <div className="founder-ava" style={{ padding: 0, overflow: 'hidden', background: 'none', border: '3px solid rgba(59,130,246,.4)', boxShadow: '0 0 40px rgba(59,130,246,.3)' }}>
                  <img src="/founder-manjunath.jpg" alt="Manjunath Yadav Meesala" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
                <div className="founder-info">
                  <div className="founder-name">Manjunath Yadav Meesala</div>
                  <div className="founder-role" style={{ color: '#3B82F6' }}>Co-Founder</div>
                  <div className="founder-loc"><Map size={14} className="inline mr-1" /> Bengaluru, Karnataka</div>
                </div>
              </div>
              <blockquote className="founder-quote" style={{ borderColor: '#3B82F6' }}>"Our mission is to build a platform that doesn't just provide content, but builds a future. By combining AI with habit-building psychology, we're ensuring every aspirant has the best shot at success. VidyaJaya is the ultimate companion for those who are serious about their goals."</blockquote>
              <div className="founder-contacts">
                <div className="fc"><span className="fc-icon"><Mail size={14} /></span><span className="fc-val">manjunath@vidyajaya.in</span></div>
                <div className="fc"><span className="fc-icon"><Instagram size={14} /></span><span className="fc-val">@manjunathyadav</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-band">
        <div className="container">
          <h2 className="cta-title">Start your streak today <Flame size={32} className="inline ml-2" fill="currentColor" /></h2>
          <p className="cta-sub">Join thousands of aspirants who study daily, track their rank, and earn rewards for performance – not luck. Free forever to start, upgrade only when you’re ready.</p>
          <div className="cta-btns">
            <button onClick={handleCtaClick} className="btn btn-white btn-lg">Join VidyaJaya – Take Today’s Free Mock →</button>
            <a href="https://t.me/vidyajayaa" target="_blank" rel="noopener noreferrer" className="btn btn-lg" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', borderColor: 'rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={20} /> Join Telegram
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="nav-logo-icon">
                  <img src="/logo.png" alt="VidyaJaya Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '20px', fontWeight: 900, color: '#fff' }}>Vidya<span style={{ color: 'var(--orange)' }}>Jaya</span></span>
              </div>
              <p className="footer-desc">India's AI-powered daily mock test platform. UPSC · SSC · RRB · Banking. Build streaks, earn coins, win real rewards.</p>
            </div>
            <div>
              <div className="footer-col-title">Platform</div>
              <Link className="footer-link" to="/login">Dashboard</Link>
              <Link className="footer-link" to="/login">Daily Tests</Link>
              <Link className="footer-link" to="/login">Leaderboard</Link>
            </div>
            <div>
              <div className="footer-col-title">Exams</div>
              <span className="footer-link">UPSC Civil Services</span>
              <span className="footer-link">SSC CGL / CHSL</span>
              <span className="footer-link">RRB NTPC / Group D</span>
            </div>
            <div>
              <div className="footer-col-title">Company</div>
              <span className="footer-link">About Us</span>
              <span className="footer-link">Contact</span>
              <span className="footer-link">Privacy Policy</span>
            </div>
            <div>
              <div className="footer-col-title">Resources</div>
              <Link className="footer-link" to="/what-is-vidyajaya">What is Vidyajaya?</Link>
              <Link className="footer-link" to="/how-it-helps-students">How it Helps</Link>
              <Link className="footer-link" to="/why-vidyajaya-is-best">Why Vidyajaya is Best</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 VidyaJaya Technologies Pvt Ltd · All rights reserved · Built from Kadiri, Andhra Pradesh</div>
            <div className="social-row">
              <a href="https://www.instagram.com/vidyajaya.in?igsh=cGNzZGkxYTFiODgx" target="_blank" rel="noopener noreferrer" className="social-btn" title="Instagram"><Instagram size={18} /></a>
              <a href="https://t.me/vidyajayaa" target="_blank" rel="noopener noreferrer" className="social-btn" title="Telegram"><Send size={18} /></a>
              <div className="social-btn" title="YouTube"><Youtube size={18} /></div>
              <a href="https://www.linkedin.com/in/vidyajaya-where-knowledge-pays-off-0480a0405?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="social-btn" title="LinkedIn"><Linkedin size={18} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
