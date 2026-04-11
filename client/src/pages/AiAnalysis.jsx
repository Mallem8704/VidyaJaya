import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Briefcase, Brain, TrendingUp } from 'lucide-react';

const AiAnalysis = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-10">
      
      <div className="flex flex-col md:flex-row gap-6 items-center bg-gradient-to-br from-[#0B1120] to-[#1E1B4B] p-8 rounded-2xl text-white shadow-xl">
         <div className="w-24 h-24 bg-accent-purple bg-opacity-30 rounded-full flex items-center justify-center text-5xl shrink-0 border border-accent-purple border-opacity-50 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            🤖
         </div>
         <div className="text-center md:text-left">
            <h2 className="text-3xl font-heading font-bold mb-2">VidyaJaya Intelligence Profile</h2>
            <p className="text-purple-200">Based on your activity over the last 30 days and 48 mock tests.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card p-6 border-t-4 border-accent-green">
            <h3 className="font-heading font-bold text-xl flex items-center gap-2 mb-6"><CheckCircle className="text-accent-green"/> Strengths & Mastery</h3>
            <ul className="space-y-4">
               <li className="p-4 bg-[var(--bg-light)] rounded-lg border border-[var(--border)]">
                  <div className="font-bold mb-1">Polity & Governance</div>
                  <p className="text-sm text-[var(--text-secondary)]">Accuracy is top 5% globally. Keep it up.</p>
               </li>
               <li className="p-4 bg-[var(--bg-light)] rounded-lg border border-[var(--border)]">
                  <div className="font-bold mb-1">Logical Reasoning</div>
                  <p className="text-sm text-[var(--text-secondary)]">Speed has improved by 40% this week.</p>
               </li>
            </ul>
         </motion.div>

         <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card p-6 border-t-4 border-red-500">
            <h3 className="font-heading font-bold text-xl flex items-center gap-2 mb-6"><AlertTriangle className="text-red-500"/> Critical Weaknesses</h3>
            <ul className="space-y-4">
               <li className="p-4 bg-red-50 dark:bg-[#1a0c0c] rounded-lg border border-red-100 dark:border-red-900">
                  <div className="font-bold text-red-700 dark:text-red-400 mb-1">Economics - Budgeting</div>
                  <p className="text-sm text-red-600 dark:text-red-300 opacity-80">You consistently skip questions involving fiscal deficit calculations.</p>
               </li>
               <li className="p-4 bg-red-50 dark:bg-[#1a0c0c] rounded-lg border border-red-100 dark:border-red-900">
                  <div className="font-bold text-red-700 dark:text-red-400 mb-1">Time Management</div>
                  <p className="text-sm text-red-600 dark:text-red-300 opacity-80">You spend an average of 3m 20s on Modern History questions, which is too long.</p>
               </li>
            </ul>
         </motion.div>
      </div>

      <div className="card p-8 bg-[var(--bg-light)]">
         <h3 className="font-heading font-bold text-2xl flex items-center gap-2 mb-6"><Brain className="text-secondary"/> AI 7-Day Action Plan</h3>
         
         <div className="relative border-l-2 border-secondary pl-8 py-2 space-y-8 ml-4">
            
            <div className="relative">
               <div className="absolute w-4 h-4 rounded-full bg-secondary -left-[39px] top-1"></div>
               <div className="font-bold text-secondary mb-1">Day 1 - 2: Foundation Rebuild</div>
               <div className="card p-4">
                  <p className="text-sm font-medium">Watch Economics Concept Class videos #12 through #15. Take the "Economy Deep Dive" sectional mock after.</p>
               </div>
            </div>

            <div className="relative">
               <div className="absolute w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 -left-[39px] top-1"></div>
               <div className="font-bold text-[var(--text-secondary)] mb-1">Day 3 - 5: Speed Drills</div>
               <div className="card p-4 opacity-70">
                  <p className="text-sm font-medium">Use the AI Drill mode for Modern History. Aim for under 60 seconds per question.</p>
               </div>
            </div>

            <div className="relative">
               <div className="absolute w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 -left-[39px] top-1"></div>
               <div className="font-bold text-[var(--text-secondary)] mb-1">Day 6 - 7: Ultimate Test</div>
               <div className="card p-4 opacity-70">
                  <p className="text-sm font-medium">Take Full Length Mock Test #48. Implement the skipping strategy the AI recommended for lengthy qualitative questions.</p>
               </div>
            </div>

         </div>
      </div>

    </div>
  );
};

export default AiAnalysis;
