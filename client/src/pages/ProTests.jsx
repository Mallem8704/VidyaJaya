import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Target, Star, Clock, BookOpen, Share2, Award, ArrowRight, Zap, Gem, Lock } from 'lucide-react';

import { useAuthStore } from '../store/authStore';

const ProTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchProTests = async () => {
      try {
        const res = await axios.get('/api/tests/pro');
        setTests(res.data);
      } catch (err) {
        console.error('Error fetching PRO tests:', err);
        toast.error('Failed to load exclusive tests');
      } finally {
        setLoading(false);
      }
    };
    fetchProTests();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-secondary border-t-white rounded-full animate-spin"></div>
        <p className="text-secondary font-bold font-heading animate-pulse">Loading Exclusive Content...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-16 px-4">
      
      {/* Premium Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-[#0a2540] to-secondary p-8 md:p-12 shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-gold rounded-full blur-[120px] opacity-20 -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-20 -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-gold/20 text-accent-gold border border-accent-gold/30 mb-6 backdrop-blur-md">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Premium Access</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4 leading-tight">
              Exclusive <span className="text-accent-gold">PRO</span> Mock Tests
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mb-8 leading-relaxed">
              Unlock the highest quality, AI-curated mock tests. Compete with elite aspirants, 
              climb the PRO leaderboard, and earn real cash rewards for your accuracy.
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
                <Zap size={18} className="text-secondary" />
                <span className="text-sm font-semibold text-white">Full Length Mocks</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
                <Target size={18} className="text-accent-gold" />
                <span className="text-sm font-semibold text-white">Cash Rewards</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
                <Star size={18} className="text-purple-400" />
                <span className="text-sm font-semibold text-white">PRO Leaderboard</span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block w-72 h-72 relative animate-float">
             <div className="absolute inset-0 bg-accent-gold rounded-full blur-2xl opacity-20 animate-pulse"></div>
             <div className="relative w-full h-full bg-gradient-to-tr from-accent-gold/20 to-secondary/20 rounded-3xl border border-white/20 flex items-center justify-center backdrop-blur-lg">
                <Gem size={120} className="text-accent-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
             </div>
          </div>
        </div>
      </div>

      {/* Test Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-heading font-bold text-[var(--text-primary)]">Featured Pro Series</h2>
            <p className="text-[var(--text-secondary)]">Exclusively available for your current tier.</p>
          </div>
          <div className="bg-secondary/10 text-secondary px-4 py-1 rounded-full text-sm font-bold border border-secondary/20">
            {tests.length} Exclusive Tests
          </div>
        </div>

        {tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] border-dashed">
            <Trophy size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">New Pro Tests Loading...</h3>
            <p className="text-[var(--text-secondary)] max-w-sm">Our experts are currently curating the next set of exclusive mock tests. Check back in a few hours!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tests.map((test, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={test.id}
                className="group relative bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] hover:border-secondary overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-secondary/5 flex flex-col h-full"
              >
                {/* Reward Potential Tag */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-1.5 bg-[#0a2540] text-accent-gold px-3 py-1.5 rounded-full text-xs font-bold border border-accent-gold/30 shadow-lg shadow-black/20">
                    <Zap size={12} fill="currentColor" />
                    Win up to ₹50
                  </div>
                </div>

                {/* Card Header Background */}
                <div className="h-32 bg-gradient-to-br from-primary to-secondary p-6 relative">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                  <span className="relative z-10 text-xs font-black uppercase tracking-[0.2em] text-white/70">
                    {test.category} PREMIER
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col -mt-10 relative z-10">
                  <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-sm mb-4">
                    <h3 className="text-xl font-heading font-black text-[var(--text-primary)] leading-tight group-hover:text-secondary transition-colors">
                      {test.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-6 h-10">
                    {test.description || 'Full-length expert mock test with instant AI analysis and cash rewards for top performers.'}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-secondary">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Duration</p>
                        <p className="text-xs font-bold text-[var(--text-primary)]">{Math.round((test.duration || 0) / 60)} Mins</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-accent-gold">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Questions</p>
                        <p className="text-xs font-bold text-[var(--text-primary)]">{test.total_questions} Qs</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <Link
                      to={!user?.is_pro ? '/pricing' : `/test/${test.id}`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-secondary to-[#4361ee] text-white font-bold rounded-xl shadow-lg shadow-secondary/20 hover:shadow-secondary/40 hover:-translate-y-0.5 transition-all active:scale-95 group/btn"
                    >
                      {!user?.is_pro ? (
                        <>
                          <Lock size={18} />
                          Unlock with PRO
                        </>
                      ) : (
                        <>
                          Start Premium Mock
                          <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Link>
                    
                    <div className="flex justify-center items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest py-1">
                      <Award size={12} className="text-accent-gold" />
                      Leaderboard Eligible
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Rewards Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
         <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#1a1610] dark:to-[#221c12] p-6 rounded-2xl border border-amber-200/50 dark:border-amber-900/30">
            <div className="w-10 h-10 bg-accent-gold/20 rounded-lg flex items-center justify-center text-accent-gold mb-4">
              <Zap size={20} fill="currentColor" />
            </div>
            <h4 className="font-bold text-lg mb-2">Double Earnings</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Earn up to 50 coins per test based on your accuracy and speed.</p>
         </div>
         <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-[#101625] dark:to-[#121c2e] p-6 rounded-2xl border border-blue-200/50 dark:border-blue-900/30">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500 mb-4">
              <Trophy size={20} />
            </div>
            <h4 className="font-bold text-lg mb-2">Elite Ranking</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Compete in the PRO-only weekly/monthly leaderboards for massive bonuses.</p>
         </div>
         <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-[#102516] dark:to-[#122e1c] p-6 rounded-2xl border border-green-200/50 dark:border-green-900/30">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500 mb-4">
              <CheckCircle size={20} />
            </div>
            <h4 className="font-bold text-lg mb-2">Verified Content</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Questions are strictly verified against current exam patterns.</p>
         </div>
      </div>
    </div>
  );
};

const CheckCircle = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default ProTests;
