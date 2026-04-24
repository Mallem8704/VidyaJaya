import React from 'react';
import { Link } from 'react-router-dom';

export default function WhatIsVidyajaya() {
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
          What is <span className="text-primary">Vidyajaya</span>? — The Future of Exam Preparation in India
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            Vidyajaya is India's first AI-powered student platform designed to bridge the gap between hard work and results. 
            More than just a test series, Vidyajaya is a complete ecosystem that rewards consistency, analyzes performance with precision, 
            and prepares students for India's toughest competitive exams including UPSC, SSC, Banking, and RRB.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">The Vidyajaya Platform Vision</h2>
          <p>
            The <strong>Vidyajaya platform</strong> was built with one goal: to ensure that no student's hard work goes unnoticed. 
            Traditional coaching centers and apps focus on delivering content, but Vidyajaya focuses on <strong>habit-building</strong>. 
            By gamifying the study process through streaks and rewards, we turn the daily grind into an engaging competition.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Key Features of the Vidyajaya App</h2>
          <ul className="list-disc pl-6 space-y-4">
            <li>
              <strong>AI-Generated Mock Tests:</strong> Unlike other platforms that reuse old question banks, the <strong>Vidyajaya app</strong> 
              uses advanced AI (GPT-4o) to generate fresh, relevant questions every night, tailored to the latest exam patterns.
            </li>
            <li>
              <strong>Daily Rewards & Streaks:</strong> We believe in rewarding consistency. Students earn coins for every day they study, 
              which can be redeemed for premium features or cash rewards.
            </li>
            <li>
              <strong>Precision AI Analysis:</strong> After every test, our AI analyzes your weak areas down to the specific chapter level, 
              providing a personalized study plan for the next 7 days.
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">Empowering 2.5 Lakh+ Students</h2>
          <p>
            Vidyajaya is more than just technology; it's a community. With over 2.5 lakh registered students, we are building 
            the most authoritative source of information and practice for serious aspirants across India. Whether you are 
            preparing for the UPSC Civil Services or aiming for a position in the SSC, Vidyajaya provides the tools you need to succeed.
          </p>
        </div>

        <div className="mt-16 p-8 bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to start your journey?</h3>
          <p className="mb-6">Join thousands of students who are already using Vidyajaya to crack their dream exams.</p>
          <Link to="/signup" className="btn btn-primary btn-lg px-12">Join Vidyajaya Today</Link>
        </div>
      </main>

      <footer className="py-12 border-t border-[var(--border)] text-center text-[var(--text-secondary)]">
        <p>© 2026 Vidyajaya Technologies Pvt Ltd. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/how-it-helps-students" className="hover:text-primary">How it Helps</Link>
          <Link to="/why-vidyajaya-is-best" className="hover:text-primary">Why Vidyajaya</Link>
        </div>
      </footer>
    </div>
  );
}
