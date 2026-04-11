import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Flame, Crown } from 'lucide-react';

const mockLeaderboard = [
  { id: 1, name: "Kiran R.", score: 2450, streak: 45, plan: "PRO" },
  { id: 2, name: "Sneha P.", score: 2310, streak: 32, plan: "FREE" },
  { id: 3, name: "Rahul M.", score: 2100, streak: 12, plan: "PRO" },
  { id: 4, name: "Priya S.", score: 1950, streak: 8, plan: "FREE" },
  { id: 5, name: "Vikram K.", score: 1820, streak: 21, plan: "FREE" },
  { id: 6, name: "Anjali T.", score: 1750, streak: 5, plan: "PRO" },
  { id: 7, name: "Surya V.", score: 1600, streak: 14, plan: "FREE" },
];

const Leaderboard = () => {
  const [tab, setTab] = useState('global'); // 'global' or 'weekly'

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold flex items-center gap-2">
            <Trophy className="text-accent-gold" size={32} /> Live Leaderboard
          </h2>
          <p className="text-[var(--text-secondary)] mt-1">Compete based on skill. Earn based on performance.</p>
        </div>
        
        <div className="flex bg-[var(--bg-light)] p-1 rounded-xl border border-[var(--border)]">
          <button 
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'global' ? 'bg-[var(--bg-card)] shadow-sm text-secondary' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            onClick={() => setTab('global')}
          >
            All-Time Global
          </button>
          <button 
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'weekly' ? 'bg-[var(--bg-card)] shadow-sm text-secondary' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            onClick={() => setTab('weekly')}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Podium (Top 3) */}
      <div className="flex justify-center items-end gap-2 md:gap-6 pt-10 pb-6 px-4">
         
         {/* Rank 2 */}
         <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center text-2xl font-bold font-heading mb-4 shadow-lg z-10 relative">
              <Medal className="absolute -top-3 -right-2 text-gray-500" fill="currentColor" size={24}/>
              <span className="text-gray-600">S</span>
            </div>
            <div className="card w-24 md:w-32 h-32 md:h-40 bg-gradient-to-t from-gray-100 to-white dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-start pt-6 border-t-4 border-gray-400">
               <span className="font-bold text-sm text-[var(--text-primary)] truncate px-2">{mockLeaderboard[1].name}</span>
               <span className="font-heading font-bold text-lg text-gray-500 mt-2">{mockLeaderboard[1].score}</span>
            </div>
         </motion.div>

         {/* Rank 1 */}
         <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center relative z-20">
            <div className="w-20 h-20 rounded-full bg-yellow-100 border-4 border-accent-gold flex items-center justify-center text-3xl font-bold font-heading mb-4 shadow-xl relative">
              <Crown className="absolute -top-6 text-accent-gold" fill="currentColor" size={36}/>
              <span className="text-yellow-700">K</span>
            </div>
            <div className="card w-28 md:w-40 h-40 md:h-48 bg-gradient-to-t from-yellow-50 to-white dark:from-yellow-900/30 dark:to-yellow-800/20 flex flex-col items-center justify-start pt-6 border-t-4 border-accent-gold shadow-2xl">
               <span className="font-bold text-md text-[var(--text-primary)] truncate px-2">{mockLeaderboard[0].name}</span>
               <span className="font-heading font-bold text-2xl text-accent-gold mt-2">{mockLeaderboard[0].score}</span>
            </div>
         </motion.div>

         {/* Rank 3 */}
         <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 border-4 border-orange-400 flex items-center justify-center text-2xl font-bold font-heading mb-4 shadow-lg z-10 relative">
              <Medal className="absolute -top-3 -right-2 text-orange-600" fill="currentColor" size={24}/>
              <span className="text-orange-700">R</span>
            </div>
            <div className="card w-24 md:w-32 h-28 md:h-36 bg-gradient-to-t from-orange-50 to-white dark:from-orange-900/30 dark:to-orange-800/20 flex flex-col items-center justify-start pt-4 border-t-4 border-orange-400">
               <span className="font-bold text-sm text-[var(--text-primary)] truncate px-2">{mockLeaderboard[2].name}</span>
               <span className="font-heading font-bold text-lg text-orange-500 mt-2">{mockLeaderboard[2].score}</span>
            </div>
         </motion.div>

      </div>

      {/* List */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-[var(--bg-light)] border-b border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          <div className="col-span-2 md:col-span-1 text-center">Rank</div>
          <div className="col-span-5 md:col-span-5">Warrior</div>
          <div className="col-span-2 hidden md:block text-center">Plan</div>
          <div className="col-span-3 md:col-span-2 text-center">Streak</div>
          <div className="col-span-2 md:col-span-2 text-right pr-4">Score</div>
        </div>
        
        <div className="divide-y divide-[var(--border)]">
          {mockLeaderboard.slice(3).map((user, index) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[var(--bg-light)] transition-colors"
            >
              <div className="col-span-2 md:col-span-1 text-center font-bold font-heading text-lg text-[var(--text-secondary)]">
                #{index + 4}
              </div>
              <div className="col-span-5 md:col-span-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {user.name.charAt(0)}
                </div>
                <span className="font-bold truncate">{user.name}</span>
              </div>
              <div className="col-span-2 hidden md:flex justify-center">
                {user.plan === 'PRO' 
                  ? <span className="text-[10px] bg-accent-gold bg-opacity-20 text-yellow-600 dark:text-yellow-400 font-bold px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-900">PRO</span>
                  : <span className="text-[10px] text-gray-400">Basic</span>
                }
              </div>
              <div className="col-span-3 md:col-span-2 flex items-center justify-center gap-1 font-bold text-orange-500">
                <Flame size={16} fill="currentColor" /> {user.streak}
              </div>
              <div className="col-span-2 md:col-span-2 text-right pr-4 font-heading font-bold text-lg">
                {user.score}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default Leaderboard;
