import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Briefcase, Brain, TrendingUp, Loader2, Info } from 'lucide-react';
import axios from 'axios';

const AiAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/ai/analysis');
        setData(res.data);
      } catch (err) {
        console.error('AI Analysis Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-secondary animate-spin" />
        <p className="text-[var(--text-secondary)] font-medium">Analyzing your performance data...</p>
      </div>
    );
  }

  if (!data?.hasData) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-10 card text-center space-y-6">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-500 mx-auto">
          <Info size={40} />
        </div>
        <h2 className="text-2xl font-bold">Not Enough Data</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          Our AI needs at least 1-2 completed mock tests to generate your performance intelligence profile. Start your first test now!
        </p>
        <button onClick={() => window.location.href='/tests'} className="btn btn-primary px-8">Browse Mock Tests</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-10">
      
      <div className="flex flex-col md:flex-row gap-6 items-center bg-gradient-to-br from-[#0B1120] to-[#1E1B4B] p-8 rounded-2xl text-white shadow-xl">
         <div className="w-24 h-24 bg-accent-purple bg-opacity-30 rounded-full flex items-center justify-center text-5xl shrink-0 border border-accent-purple border-opacity-50 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            🤖
         </div>
         <div className="text-center md:text-left">
            <h2 className="text-3xl font-heading font-bold mb-2">VidyaJaya Intelligence Profile</h2>
            <p className="text-purple-200">Based on your activity over {data.stats.testsTaken} mock tests. Accuracy: {data.stats.avgAccuracy}%</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card p-6 border-t-4 border-accent-green">
            <h3 className="font-heading font-bold text-xl flex items-center gap-2 mb-6"><CheckCircle className="text-accent-green"/> Strengths & Mastery</h3>
            <ul className="space-y-4">
               {data.strengths.map((s, i) => (
                  <li key={i} className="p-4 bg-[var(--bg-light)] rounded-lg border border-[var(--border)]">
                     <div className="font-bold mb-1">{s.topic}</div>
                     <p className="text-sm text-[var(--text-secondary)]">{s.insight}</p>
                  </li>
               ))}
            </ul>
         </motion.div>

         <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card p-6 border-t-4 border-red-500">
            <h3 className="font-heading font-bold text-xl flex items-center gap-2 mb-6"><AlertTriangle className="text-red-500"/> Critical Weaknesses</h3>
            <ul className="space-y-4">
               {data.weaknesses.map((w, i) => (
                  <li key={i} className="p-4 bg-red-50 dark:bg-[#1a0c0c] rounded-lg border border-red-100 dark:border-red-900">
                     <div className="font-bold text-red-700 dark:text-red-400 mb-1">{w.topic}</div>
                     <p className="text-sm text-red-600 dark:text-red-300 opacity-80">{w.insight}</p>
                  </li>
               ))}
            </ul>
         </motion.div>
      </div>

      <div className="card p-8 bg-[var(--bg-light)]">
         <h3 className="font-heading font-bold text-2xl flex items-center gap-2 mb-6"><Brain className="text-secondary"/> AI 7-Day Action Plan</h3>
         
         <div className="relative border-l-2 border-secondary pl-8 py-2 space-y-8 ml-4">
            {data.actionPlan.map((plan, i) => (
               <div key={i} className="relative">
                  <div className={`absolute w-4 h-4 rounded-full ${i === 0 ? 'bg-secondary' : 'bg-gray-300 dark:bg-gray-600'} -left-[39px] top-1`}></div>
                  <div className={`font-bold ${i === 0 ? 'text-secondary' : 'text-[var(--text-secondary)]'} mb-1`}>{plan.days}</div>
                  <div className={`card p-4 ${i !== 0 ? 'opacity-70' : ''}`}>
                     <p className="text-sm font-medium">{plan.task}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
};

export default AiAnalysis;
