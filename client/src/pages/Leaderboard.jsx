import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../utils/supabase';
import { 
  Trophy, Crown, Medal, Flame, Timer, 
  ChevronRight, Sparkles, TrendingUp, Lock 
} from 'lucide-react';
import ProUpgradeModal from '../components/ProUpgradeModal';

const Leaderboard = () => {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('daily'); // 'daily', 'global', 'weekly', 'monthly'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const isUserPro = user?.is_pro || user?.plan === 'pro' || user?.plan === 'premium';

  // --- FETCH LOGIC ---
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/leaderboard/${tab}`);
      setLeaderboard(res.data.data || []);
    } catch (err) {
      console.error('Leaderboard Fetch Error:', err);
      toast.error('Failed to update rankings');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  // --- INITIAL FETCH & REALTIME ---
  useEffect(() => {
    fetchLeaderboard();

    // REAL-TIME SUBSCRIPTION
    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'test_results' },
        (payload) => {
          console.log('New result detected! Refreshing board...');
          if (tab === 'daily') fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tab, fetchLeaderboard]);

  // --- DERIVED STATS & INSIGHTS ---
  const myRank = leaderboard.findIndex(u => u.id === user?.id || u.name === user?.name) + 1;
  const topScorer = leaderboard[0]?.score || 0;
  const distanceToTop10 = myRank > 10 ? myRank - 10 : 0;

  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-[var(--text-primary)]">
      
      {/* 👑 HEADER & INSIGHTS */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black font-heading flex items-center gap-3">
            <Trophy className="text-yellow-500" size={40} /> Battle Royale
          </h1>
          <p className="text-[var(--text-secondary)] font-medium">
            Real-time rankings for the top UPSC warriors.
          </p>
        </div>

        {/* INSIGHT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full lg:w-auto">
          <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-orange-500 opacity-70">Top Score Today</div>
              <div className="text-xl font-black">{topScorer} XP</div>
            </div>
          </div>
          
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white">
              <Trophy size={24} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-indigo-500 opacity-70">Your Status</div>
              <div className="text-xl font-black">
                {myRank > 0 ? `#${myRank}` : 'Unranked'}
                {distanceToTop10 > 0 && <span className="text-xs font-medium ml-2 opacity-50">({distanceToTop10} from Top 10)</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📅 TAB TOGGLE */}
      <div className="flex bg-[var(--bg-card)] p-1.5 rounded-[2rem] border border-[var(--border)] w-fit mx-auto lg:mx-0">
        {['daily', 'weekly', 'monthly', 'global'].map(t => (
          <button 
            key={t}
            onClick={() => setTab(t)}
            className={`px-8 py-3 rounded-[1.5rem] font-black text-sm uppercase tracking-tighter transition-all ${tab === t ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 🚀 PODIUM SECTION */}
      <div className="flex justify-center items-end gap-2 md:gap-8 pt-12 pb-6">
        {/* 2nd Place */}
        {topThree[1] && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-300 relative mb-4">
              <img src={topThree[1].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[1].name}`} className="rounded-full" alt="" />
              <div className="absolute -bottom-2 -right-2 bg-gray-300 text-gray-800 w-8 h-8 rounded-lg flex items-center justify-center font-black border-4 border-[var(--bg-light)]">2</div>
            </div>
            <div className="w-24 md:w-32 h-28 md:h-36 bg-gradient-to-t from-gray-200/50 to-white dark:from-gray-800 dark:to-gray-700 rounded-t-3xl border-t-4 border-gray-300 flex flex-col items-center pt-4">
              <span className="font-bold text-xs truncate px-2">{topThree[1].name}</span>
              <span className="text-lg font-black text-gray-500">{topThree[1].score || topThree[1].total_score}</span>
            </div>
          </motion.div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center z-10 scale-110 md:scale-125">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-yellow-500 relative mb-6">
              <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-500 animate-bounce" size={32} />
              <img src={topThree[0].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[0].name}`} className="rounded-full" alt="" />
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white w-10 h-10 rounded-lg flex items-center justify-center font-black border-4 border-[var(--bg-light)]">1</div>
            </div>
            <div className="w-28 md:w-40 h-36 md:h-48 bg-gradient-to-t from-yellow-500/20 to-white dark:from-yellow-500/10 dark:to-gray-800 rounded-t-3xl border-t-4 border-yellow-500 flex flex-col items-center pt-6 shadow-2xl">
              <span className="font-black text-sm truncate px-2">{topThree[0].name}</span>
              <span className="text-2xl font-black text-yellow-500">{topThree[0].score || topThree[0].total_score}</span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-orange-400 relative mb-4">
              <img src={topThree[2].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[2].name}`} className="rounded-full" alt="" />
              <div className="absolute -bottom-2 -right-2 bg-orange-400 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black border-4 border-[var(--bg-light)]">3</div>
            </div>
            <div className="w-24 md:w-32 h-24 md:h-32 bg-gradient-to-t from-orange-400/20 to-white dark:from-orange-900/10 dark:to-gray-800 rounded-t-3xl border-t-4 border-orange-400 flex flex-col items-center pt-4">
              <span className="font-bold text-xs truncate px-2">{topThree[2].name}</span>
              <span className="text-lg font-black text-orange-500">{topThree[2].score || topThree[2].total_score}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* 📋 RANKING LIST */}
      <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-2xl">
        
        {/* FREE USER WARNING */}
        {!isUserPro && (
          <div className="p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Lock size={32} />
              <div>
                <h3 className="font-black text-lg">PRO BATTLE ONLY</h3>
                <p className="text-sm font-medium opacity-90">Only Pro users appear in competitive rankings. You are currently in Stealth Mode.</p>
              </div>
            </div>
            <button onClick={() => setShowUpgradeModal(true)} className="px-6 py-2 bg-white text-orange-500 font-black rounded-full text-sm hover:scale-105 transition-all">
              UPGRADE TO RANK
            </button>
          </div>
        )}

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-black animate-pulse uppercase tracking-widest text-xs">Syncing Rankings...</span>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {others.map((u, i) => (
              <div key={i} className={`p-6 flex items-center justify-between transition-all hover:bg-[var(--bg-light)] ${u.name === user?.name ? 'bg-orange-500/5 border-l-4 border-orange-500' : ''}`}>
                <div className="flex items-center gap-6">
                  <span className="w-8 text-xl font-black text-[var(--text-secondary)]">#{i + 4}</span>
                  <div className="flex items-center gap-4">
                    <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-12 h-12 rounded-2xl bg-gray-100" alt="" />
                    <div>
                      <div className="font-black text-lg">{u.name}</div>
                      <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-secondary)] uppercase">
                        {u.total_time && <span className="flex items-center gap-1"><Timer size={12}/> {u.total_time}s</span>}
                        {u.streak > 0 && <span className="flex items-center gap-1 text-orange-500"><Flame size={12}/> {u.streak} Day Streak</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-[var(--text-primary)]">{u.score || u.total_score}</div>
                  <div className="text-[10px] font-black uppercase text-orange-500">Points</div>
                </div>
              </div>
            ))}
            
            {leaderboard.length === 0 && (
              <div className="p-20 text-center space-y-4 opacity-50">
                <Sparkles size={64} className="mx-auto" />
                <h3 className="text-xl font-black">BE THE FIRST!</h3>
                <p className="font-medium">No rankings for this period yet. Start a test to claim the top spot.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <ProUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        feature="Leaderboard Ranking"
      />
    </div>
  );
};

export default Leaderboard;
