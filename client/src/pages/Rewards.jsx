import React, { useState } from 'react';
import { Award, Lock, Star, Zap, CheckCircle, ShieldCheck } from 'lucide-react';

const mockRewards = [
  { id: 1, title: 'Streak Freeze', cost: 50, icon: '❄️', desc: 'Saves your streak if you miss a day. (Max 2)' },
  { id: 2, title: 'Profile Frame: Conqueror', cost: 200, icon: '🖼️', desc: 'Adds a flaming border to your avatar.' },
  { id: 3, title: '1 AI Doubt Token', cost: 100, icon: '🤖', desc: 'Get an instant step-by-step GPT explanation.' },
];

const Rewards = () => {
  const coins = 340;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-10">
      
      {/* Overview Head */}
      <div className="bg-primary rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
        <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
           <h2 className="text-3xl font-heading font-bold mb-2">Rewards Strategy Room</h2>
           <p className="text-primary-light">Spend your hard-earned performance coins here.</p>
        </div>
        <div className="relative z-10 flex flex-col items-center md:items-end">
           <span className="text-sm text-gray-300 font-bold uppercase tracking-widest mb-1">Your Balance</span>
           <div className="text-5xl font-heading font-bold flex items-center gap-3 text-accent-gold">
              <Award size={40} className="text-accent-gold" />
              {coins} <span className="text-lg">Coins</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         
         {/* Store items */}
         <div className="space-y-6">
            <h3 className="text-2xl font-heading font-bold flex items-center gap-2">
              🛒 Tactical Upgrades
            </h3>
            <div className="grid grid-cols-1 gap-4">
               {mockRewards.map(reward => (
                  <div key={reward.id} className="card p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform border border-transparent hover:border-secondary">
                     <div className="text-4xl bg-[var(--bg-light)] p-3 rounded-xl border border-[var(--border)]">{reward.icon}</div>
                     <div className="flex-1">
                        <h4 className="font-bold text-lg">{reward.title}</h4>
                        <p className="text-sm text-[var(--text-secondary)]">{reward.desc}</p>
                     </div>
                     <button className="btn bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-[rgba(255,165,0,0.1)] dark:text-orange-400 dark:hover:bg-[rgba(255,165,0,0.2)] font-bold px-4 py-2 flex items-center gap-1 border border-orange-300 dark:border-orange-900 border-opacity-50">
                        <Award size={16}/> {reward.cost}
                     </button>
                  </div>
               ))}
               
               <div className="card p-5 flex items-center gap-4 opacity-50 bg-[var(--bg-light)]">
                   <div className="text-4xl bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border)] grayscale">🏆</div>
                   <div className="flex-1">
                      <h4 className="font-bold text-lg flex items-center gap-2">Grandmaster Title <Lock size={16}/></h4>
                      <p className="text-sm text-[var(--text-secondary)]">Requires 100+ day streak.</p>
                   </div>
                   <button disabled className="btn btn-outline text-gray-500 cursor-not-allowed">
                      Need 5000
                   </button>
               </div>
            </div>
         </div>

         {/* Subscription Plans */}
         <div className="space-y-6">
            <h3 className="text-2xl font-heading font-bold flex items-center gap-2">
              💎 VidyaJaya Supercharge Plan
            </h3>
            
            <div className="card p-8 border-2 border-secondary relative overflow-hidden bg-gradient-to-b from-[var(--bg-card)] to-[rgba(255,107,0,0.02)]">
               <div className="absolute top-4 right-4 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                 Weekly / Monthly Available
               </div>
               
               <h4 className="text-2xl font-bold mb-2">VidyaJaya PRO</h4>
               <p className="text-[var(--text-secondary)] mb-6">Unlock the full power of India's most intelligent prep engine.</p>
               
               <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                     <CheckCircle size={20} className="text-accent-green shrink-0 mt-0.5" />
                     <span className="font-medium text-[15px]">Unlimited AI Doubt Solving via Screenshot</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <CheckCircle size={20} className="text-accent-green shrink-0 mt-0.5" />
                     <span className="font-medium text-[15px]">Access to 5000+ Premium Sectional Mocks</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <CheckCircle size={20} className="text-accent-green shrink-0 mt-0.5" />
                     <span className="font-medium text-[15px]">Detailed AI Performance Diagnostic Reports</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <ShieldCheck size={20} className="text-accent-green shrink-0 mt-0.5" />
                     <span className="font-medium text-[15px]">Ad-Free Experience & Priority Rankings</span>
                  </li>
               </ul>
               
               <div className="grid grid-cols-2 gap-4">
                  <button className="btn btn-outline border-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col items-center p-4 h-auto">
                     <span className="text-xl font-bold mb-1">₹149</span>
                     <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Weekly Plan</span>
                  </button>
                  <button className="btn bg-red-600 hover:bg-red-700 text-white flex flex-col items-center p-4 h-auto shadow-lg shadow-red-600/30 border-0">
                     <span className="absolute -top-3 bg-accent-gold text-white text-[10px] px-2 py-0.5 rounded shadow">Save 20%</span>
                     <span className="text-xl font-bold mb-1">₹499</span>
                     <span className="text-xs font-bold text-rose-100 uppercase">Monthly Plan</span>
                  </button>
               </div>
               
               <p className="text-center text-xs text-[var(--text-secondary)] mt-6 flex items-center justify-center gap-1">
                 <Zap size={14} className="text-secondary" /> Cancel anytime. Secure payments.
               </p>
            </div>
         </div>

      </div>
    </div>
  );
};

export default Rewards;
