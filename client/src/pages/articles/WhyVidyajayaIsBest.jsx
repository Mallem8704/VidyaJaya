import React from 'react';
import { Link } from 'react-router-dom';

export default function WhyVidyajayaIsBest() {
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
          Why <span className="text-primary">Vidyajaya</span> is the Best Platform in India for Exam Preparation
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            In a crowded market of coaching apps, Vidyajaya stands out as the most innovative, student-centric, 
            and result-oriented platform in India. Here is why the <strong>Vidyajaya app</strong> is the choice 
            of serious aspirants.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Innovative AI-Driven Approach</h2>
          <p>
            While others rely on static PDFs and recorded videos, <strong>Vidyajaya</strong> uses generative AI 
            to create dynamic learning experiences. Every test is unique, ensuring that you aren't just 
            memorizing answers, but actually learning concepts.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Complete Authority on Exam Patterns</h2>
          <p>
            The <strong>Vidyajaya platform</strong> is updated daily to reflect the latest changes in UPSC, 
            SSC, and Banking exams. From current affairs to changes in marking schemes, our engine 
            ensures you are always practicing on the most relevant data.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">A Reward System That Works</h2>
          <p>
            Vidyajaya is the only platform that rewards you for your efforts. We understand the 
            financial burden of exam preparation, and our coin-based reward system provides 
            tangible value back to our most dedicated students.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Comparison: Why Choose Vidyajaya?</h2>
          <div className="overflow-x-auto my-8">
            <table className="w-full border-collapse border border-[var(--border)]">
              <thead>
                <tr className="bg-[var(--card-bg)]">
                  <th className="border border-[var(--border)] p-4 text-left">Feature</th>
                  <th className="border border-[var(--border)] p-4 text-left">Traditional Apps</th>
                  <th className="border border-[var(--border)] p-4 text-left font-bold text-primary">Vidyajaya</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-[var(--border)] p-4">Question Quality</td>
                  <td className="border border-[var(--border)] p-4">Recycled banks</td>
                  <td className="border border-[var(--border)] p-4 font-bold">AI-Generated Fresh Qs</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-4">Performance Insights</td>
                  <td className="border border-[var(--border)] p-4">Basic percentages</td>
                  <td className="border border-[var(--border)] p-4 font-bold">Deep AI Analytics</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-4">Student Motivation</td>
                  <td className="border border-[var(--border)] p-4">None</td>
                  <td className="border border-[var(--border)] p-4 font-bold">Streaks & Real Rewards</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-4">Accessibility</td>
                  <td className="border border-[var(--border)] p-4">High cost</td>
                  <td className="border border-[var(--border)] p-4 font-bold">Free to Start</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">Built by Students, for Students</h2>
          <p>
            Vidyajaya was born out of the personal struggles of aspirants. Every feature, from the 
            dark mode UI to the doubt-solving bot, was designed to solve real problems faced by students 
            in India every day.
          </p>
        </div>

        <div className="mt-16 p-8 bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] text-center">
          <h3 className="text-2xl font-bold mb-4">Don't settle for average prep.</h3>
          <p className="mb-6">Upgrade your preparation with India's best AI exam platform.</p>
          <Link to="/signup" className="btn btn-primary btn-lg px-12">Join the Elite Aspirants</Link>
        </div>
      </main>

      <footer className="py-12 border-t border-[var(--border)] text-center text-[var(--text-secondary)]">
        <p>© 2026 Vidyajaya Technologies Pvt Ltd. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/what-is-vidyajaya" className="hover:text-primary">What is Vidyajaya?</Link>
          <Link to="/how-it-helps-students" className="hover:text-primary">How it Helps</Link>
        </div>
      </footer>
    </div>
  );
}
