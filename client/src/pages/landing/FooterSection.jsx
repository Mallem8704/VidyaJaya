import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Linkedin, Send, Mail } from 'lucide-react';

export default function FooterSection() {
  return (
    <footer className="footer-f">
      <div className="footer-glow" />
      <div className="container-f">
        <div className="footer-grid-f">
          <div className="footer-brand-f">
            <div className="footer-logo-f">
              <div className="footer-logo-icon">
                <img src="/logo.png" alt="VidyaJaya" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <span className="footer-brand-text">Vidya<span>Jaya</span></span>
            </div>
            <p className="footer-mission">India's AI-powered student ecosystem. Learn smarter, grow faster, and earn through knowledge. Where every student's potential meets opportunity.</p>
            <div className="footer-socials">
              <a href="https://www.instagram.com/vidyajaya.in" target="_blank" rel="noopener noreferrer" className="social-f"><Instagram size={18} /></a>
              <a href="https://t.me/vidyajayaa" target="_blank" rel="noopener noreferrer" className="social-f"><Send size={18} /></a>
              <a href="https://www.linkedin.com/in/vidyajaya-where-knowledge-pays-off-0480a0405" target="_blank" rel="noopener noreferrer" className="social-f"><Linkedin size={18} /></a>
              <div className="social-f"><Youtube size={18} /></div>
            </div>
          </div>

          <div>
            <h4 className="footer-col-title-f">Platform</h4>
            <Link className="footer-link-f" to="/login">Dashboard</Link>
            <Link className="footer-link-f" to="/login">AI Mock Tests</Link>
            <Link className="footer-link-f" to="/login">Leaderboard</Link>
            <Link className="footer-link-f" to="/login">Rewards</Link>
          </div>

          <div>
            <h4 className="footer-col-title-f">Resources</h4>
            <Link className="footer-link-f" to="/what-is-vidyajaya">What is Vidyajaya?</Link>
            <Link className="footer-link-f" to="/how-it-helps-students">How it Helps</Link>
            <Link className="footer-link-f" to="/why-vidyajaya-is-best">Why Vidyajaya is Best</Link>
          </div>

          <div>
            <h4 className="footer-col-title-f">Company</h4>
            <Link className="footer-link-f" to="/privacy-policy">Privacy Policy</Link>
            <Link className="footer-link-f" to="/terms">Terms of Service</Link>
            <a className="footer-link-f" href="mailto:dheeraj@vidyajaya.in">Contact Us</a>
          </div>
        </div>

        <div className="footer-bottom-f">
          <p className="footer-copy-f">© 2026 VidyaJaya Technologies Pvt Ltd · All rights reserved · Built from Kadiri, Andhra Pradesh 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
