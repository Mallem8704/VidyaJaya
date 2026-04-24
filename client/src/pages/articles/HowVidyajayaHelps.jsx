import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function HowVidyajayaHelps() {
  useEffect(() => {
    document.title = "How Vidyajaya Helps Students Crack UPSC, SSC & Banking";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Discover how Vidyajaya helps students stay consistent, analyze their performance with AI, and earn rewards while preparing for competitive exams.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-light)] text-[var(--text)]">
      {/* Navbar Minimal */}
      <nav className="p-6 flex justify-between items-center border-b border-[var(--border)]">
        <Link to="/" className="text-2xl font-black flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg"></div>
          Vidya<span className="text-primary">Jaya</span>
        </Link>
        <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
          How <span className="text-primary">Vidyajaya</span> Helps Students Crack India's Toughest Exams
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            Preparing for exams like UPSC, SSC, and Banking is a marathon, not a sprint. 
            Vidyajaya provides the ultimate training ground for students by combining advanced AI technology 
            with proven psychological triggers to ensure long-term success.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">1. Solving the Consistency Problem</h2>
          <p>
            The biggest reason students fail is not a lack of material, but a lack of <strong>consistency</strong>. 
            The <strong>Vidyajaya app</strong> solves this through its unique "Daily Streak" system. 
            By tracking your daily progress and rewarding you with coins, Vidyajaya makes studying a habit that's hard to break.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">2. Real-Time Competition with Live Leaderboards</h2>
          <p>
            On the <strong>Vidyajaya platform</strong>, you aren't studying in a vacuum. 
            Our live leaderboard ranks you against thousands of serious aspirants across India. 
            Seeing where you stand in real-time provides the competitive edge needed to push harder every day.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">3. AI-Powered Deep Insights</h2>
          <p>
            Most students don't know why they are failing. Vidyajaya's AI analysis engine breaks down your performance 
            after every mock test. It identifies patterns in your mistakes—whether it's time management, specific 
            subject areas like Polity or Quant, or even your "guess accuracy".
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">4. Access to Premium Study Materials</h2>
          <p>
            Vidyajaya provides students with curated, AI-updated study materials and current affairs. 
            Our "Doubt Solver" feature allows you to upload any question and get an instant, 
            step-by-step explanation, ensuring you never stay stuck for long.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">5. Financial Rewards for Academic Excellence</h2>
          <p>
            We believe merit should be rewarded. Top performers on Vidyajaya can earn real rewards 
            that help cover their subscription costs or even their study expenses. 
            It’s our way of supporting the next generation of India's leaders.
          </p>
        </div>

        <div className="mt-16 p-8 bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] text-center">
          <h3 className="text-2xl font-bold mb-4">Start Improving Your Score Today</h3>
          <p className="mb-6">Join 2.5 Lakh+ students and experience the Vidyajaya difference.</p>
          <Link to="/signup" className="btn btn-primary btn-lg px-12">Start Your First Test</Link>
        </div>
      </main>

      <footer className="py-12 border-t border-[var(--border)] text-center text-[var(--text-secondary)]">
        <p>© 2026 Vidyajaya Technologies Pvt Ltd. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/what-is-vidyajaya" className="hover:text-primary">What is Vidyajaya?</Link>
          <Link to="/why-vidyajaya-is-best" className="hover:text-primary">Why Vidyajaya</Link>
        </div>
      </footer>
    </div>
  );
}
