import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, TrendingUp, Award, Calendar, Globe, Star, Zap, Crown, User, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const ProLeaderboard = () => {
  const [activeTab, setActiveTab] = useState('weekly');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/leaderboard/${activeTab}`);
      setLeaderboard(res.data);
    } catch (err) {
      console.error('Leaderboard error:', err);
      toast.error('Failed to load rankings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'weekly', label: 'Weekly', icon: Calendar },
    { id: 'monthly', label: 'Monthly', icon: Calendar },
    { id: 'global', label: 'Global', icon: Globe },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16 px-4">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-[#0a2540] to-primary p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-10 -ml-20 -mt-20"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent-gold rounded-full blur-[80px] opacity-10 -mr-10 -mb-10"></div>
        
        <div className="relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 text-accent-gold border border-accent-gold/20 mb-4">
            <Crown size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">The Elite Circle</span>
          </div>
          <h2 className="text-3xl font-heading font-black text-white mb-2 tracking-tight">
            PRO <span className="text-accent-gold">Leaderboard</span>
          </h2>
          <p className="text-gray-400 max-w-md">The most accurate and consistent aspirants in India. Rank up to unlock premium rewards.</p>
        </div>

        <div className="flex gap-2 bg-black/30 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md relative z-10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      {!loading && leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-10">
          {/* Rank 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="order-2 md:order-1 bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] shadow-xl relative text-center flex flex-col items-center"
          >
             <div className="absolute -top-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-slate-300 overflow-hidden shadow-xl bg-slate-100">
                  <img src={leaderboard[1].avatar_url || `https://ui-avatars.com/api/?name=${leaderboard[1].name}&background=cbd5e1&color=475569`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-300 text-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-[var(--bg-card)] -mt-4 shadow-md">2</div>
             </div>
             <div className="mt-12 w-full">
                <h4 className="font-bold text-lg truncate mb-1">{leaderboard[1].name}</h4>
                <p className="text-secondary font-black text-xl mb-4">{activeTab === 'weekly' ? leaderboard[1].weekly_score : activeTab === 'monthly' ? leaderboard[1].monthly_score : leaderboard[1].total_score} <span className="text-[10px] uppercase text-gray-400">Pts</span></p>
                <div className="bg-slate-50 dark:bg-slate-900/50 py-2 px-4 rounded-xl flex justify-between items-center text-xs">
                   <span className="text-gray-400 font-bold uppercase">Accuracy</span>
                   <span className="font-black text-slate-600 dark:text-slate-400">{leaderboard[1].accuracy || 0}%</span>
                </div>
             </div>
          </motion.div>

          {/* Rank 1 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-1 md:order-2 bg-gradient-to-b from-accent-gold/20 to-[var(--bg-card)] p-8 rounded-[40px] border-2 border-accent-gold shadow-2xl shadow-accent-gold/10 relative text-center flex flex-col items-center mb-4 md:mb-8"
          >
             <div className="absolute -top-12 flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
                    <Crown size={32} className="text-accent-gold fill-accent-gold drop-shadow-lg" />
                  </div>
                  <div className="w-28 h-28 rounded-full border-4 border-accent-gold overflow-hidden shadow-2xl bg-amber-50">
                    <img src={leaderboard[0].avatar_url || `https://ui-avatars.com/api/?name=${leaderboard[0].name}&background=fcd34d&color=b45309`} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="bg-accent-gold text-white w-10 h-10 rounded-full flex items-center justify-center font-black border-4 border-[var(--bg-card)] -mt-5 shadow-lg">1</div>
             </div>
             <div className="mt-16 w-full">
                <h4 className="font-black text-2xl truncate mb-1 text-accent-gold drop-shadow-sm">{leaderboard[0].name}</h4>
                <p className="text-secondary font-black text-3xl mb-6">{activeTab === 'weekly' ? leaderboard[0].weekly_score : activeTab === 'monthly' ? leaderboard[0].monthly_score : leaderboard[0].total_score} <span className="text-[12px] uppercase text-gray-400">Pts</span></p>
                <div className="flex gap-2">
                   <div className="flex-1 bg-accent-gold/10 py-3 px-2 rounded-2xl flex flex-col items-center">
                      <span className="text-[10px] font-bold text-accent-gold uppercase mb-1">Streak</span>
                      <span className="font-black text-lg text-secondary flex items-center gap-1"><Zap size={14} fill="currentColor" />{leaderboard[0].streak || 0}</span>
                   </div>
                   <div className="flex-1 bg-accent-gold/10 py-3 px-2 rounded-2xl flex flex-col items-center">
                      <span className="text-[10px] font-bold text-accent-gold uppercase mb-1">Coins</span>
                      <span className="font-black text-lg text-secondary flex items-center gap-1"><Star size={14} fill="currentColor" />{leaderboard[0].coins || 0}</span>
                   </div>
                </div>
             </div>
          </motion.div>

          {/* Rank 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="order-3 bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] shadow-xl relative text-center flex flex-col items-center"
          >
             <div className="absolute -top-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-amber-600 overflow-hidden shadow-xl bg-orange-50">
                  <img src={leaderboard[2].avatar_url || `https://ui-avatars.com/api/?name=${leaderboard[2].name}&background=ea580c&color=7c2d12`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-[var(--bg-card)] -mt-4 shadow-md">3</div>
             </div>
             <div className="mt-12 w-full">
                <h4 className="font-bold text-lg truncate mb-1">{leaderboard[2].name}</h4>
                <p className="text-secondary font-black text-xl mb-4">{activeTab === 'weekly' ? leaderboard[2].weekly_score : activeTab === 'monthly' ? leaderboard[2].monthly_score : leaderboard[2].total_score} <span className="text-[10px] uppercase text-gray-400">Pts</span></p>
                <div className="bg-orange-50 dark:bg-orange-900/20 py-2 px-4 rounded-xl flex justify-between items-center text-xs">
                   <span className="text-gray-400 font-bold uppercase">Accuracy</span>
                   <span className="font-black text-orange-600 dark:text-orange-400">{leaderboard[2].accuracy || 0}%</span>
                </div>
             </div>
          </motion.div>
        </div>
      )}

      {/* Main Ranking Table */}
      <div className="bg-[var(--bg-card)] rounded-[32px] border border-[var(--border)] shadow-xl overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-light)]">
           <h3 className="font-heading font-black text-lg flex items-center gap-2">
             <Trophy size={20} className="text-secondary" />
             Full Ranking List
           </h3>
           <div className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest">Top 50 PROs</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest bg-[var(--bg-light)]/50">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Aspirant</th>
                <th className="px-6 py-4">Goal</th>
                <th className="px-6 py-4 text-center">Streak</th>
                <th className="px-6 py-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="h-4 w-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-12 bg-gray-200 mx-auto rounded"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-16 bg-gray-200 ml-auto rounded"></div></td>
                  </tr>
                ))
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-gray-500 font-medium">
                    No PRO users in this category yet. Be the first to rank up!
                  </td>
                </tr>
              ) : (
                leaderboard.map((player, index) => (
                  <tr 
                    key={index} 
                    className={`group hover:bg-secondary/5 transition-colors ${player.id === user?.id ? 'bg-secondary/10 border-l-4 border-secondary' : ''}`}
                  >
                    <td className="px-6 py-5">
                      <span className={`font-black text-lg ${index < 3 ? 'text-secondary' : 'text-gray-400'}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-[var(--border)] overflow-hidden shadow-sm flex items-center justify-center font-bold">
                          {player.avatar_url ? (
                            <img src={player.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            player.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text-primary)] group-hover:text-secondary transition-colors">{player.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Level {Math.floor((player.total_score || 0) / 1000) + 1} Aspirant</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                        {player.exam_goal}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center gap-1 font-black text-secondary">
                        <Zap size={14} fill="currentColor" />
                        {player.streak}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="font-black text-lg text-[var(--text-primary)]">
                        {activeTab === 'weekly' ? player.weekly_score : activeTab === 'monthly' ? player.monthly_score : player.total_score}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
          <div className="p-6 bg-[var(--bg-light)] border-t border-[var(--border)] text-center">
            <p className="text-sm text-gray-500">
              Rankings refresh every <span className="font-bold text-secondary">10 minutes</span>. Consistent daily activity increases your rank faster.
            </p>
          </div>
        )}
      </div>

      {/* My Stats Banner */}
      <div className="bg-gradient-to-r from-secondary/10 to-accent-gold/10 p-6 rounded-3xl border border-secondary/20 flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-white shadow-lg">
              <User size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg">My PRO Status</h4>
              <p className="text-sm text-[var(--text-secondary)]">Your current standing among the elite.</p>
            </div>
         </div>
         <div className="flex gap-8">
            <div className="text-center">
               <p className="text-[10px] uppercase font-bold text-gray-400">Weekly Rank</p>
               <p className="text-xl font-black text-secondary">#{user?.weekly_rank || '—'}</p>
            </div>
            <div className="text-center">
               <p className="text-[10px] uppercase font-bold text-gray-400">Accuracy</p>
               <p className="text-xl font-black text-accent-green">{user?.accuracy || 0}%</p>
            </div>
            <div className="text-center">
               <p className="text-[10px] uppercase font-bold text-gray-400">Earnings</p>
               <p className="text-xl font-black text-accent-gold flex items-center gap-1 justify-center"><Star size={16} fill="currentColor" />{user?.coins || 0}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProLeaderboard;
