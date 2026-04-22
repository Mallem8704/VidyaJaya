import React, { useState, useEffect } from 'react';
import { Target, MonitorPlay, Zap, ArrowRight, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const baseTopics = [
  { name: 'Indian Polity', count: 1240, progress: 45, icon: '📜' },
  { name: 'Modern History', count: 850, progress: 20, icon: '⚔️' },
  { name: 'Geography', count: 920, progress: 10, icon: '🌍' },
  { name: 'Economy', count: 650, progress: 60, icon: '📈' },
  { name: 'Quantitative Aptitude', count: 1500, progress: 5, icon: '🧮' },
  { name: 'Logical Reasoning', count: 1100, progress: 80, icon: '🧩' },
];

const Practice = () => {
  const [testsTaken, setTestsTaken] = useState(0);

  useEffect(() => {
    axios.get('/api/dashboard')
      .then(res => {
         setTestsTaken(res.data.testsTaken || 0);
      })
      .catch(err => console.error(err));
  }, []);

  const practiceTopics = baseTopics.map(t => ({
    ...t,
    progress: testsTaken === 0 ? 0 : t.progress
  }));

  const handleComingSoon = () => {
    toast("Feature coming soon 🚀", { icon: "🚀" });
  };
  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-10">
       
       <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary to-primary-light flex-1 p-8 text-white flex items-center justify-between overflow-hidden relative">
             <div className="relative z-10 w-2/3">
                <h2 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2"><Target size={28}/> AI Drill Mode</h2>
                <p className="text-gray-200 text-sm mb-6">Our AI analyzes your weak subjects and generates a custom 20-question rapid drill specifically for you.</p>
                <button onClick={handleComingSoon} className="btn bg-white text-primary hover:bg-gray-100 font-bold px-6 py-2 shadow-lg">Start AI Drill</button>
             </div>
             <div className="text-8xl opacity-10 absolute -right-6 -bottom-6">🧠</div>
          </div>
          
          <div className="card w-full md:w-1/3 p-6 flex flex-col justify-center items-center text-center">
             <div className="w-16 h-16 bg-accent-green bg-opacity-20 rounded-full flex items-center justify-center text-accent-green mb-4">
                <MonitorPlay size={32} />
             </div>
             <h3 className="font-bold text-lg mb-1">Concept Classes</h3>
             <p className="text-sm text-[var(--text-secondary)] mb-4">Watch micro-lectures on topics you struggle with.</p>
             <button onClick={handleComingSoon} className="text-sm font-bold text-secondary flex items-center gap-1 hover:underline">Explore Library <ArrowRight size={14}/></button>
          </div>
       </div>

       <div>
          <h3 className="font-heading font-bold text-2xl mb-6">Subject Wise Practice</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {practiceTopics.map((topic, i) => (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: i * 0.1 }}
                 key={i} 
                 className="card p-6 hover:shadow-lg transition-shadow cursor-pointer border border-[var(--border)] hover:border-accent-purple"
               >
                 <div className="flex justify-between items-start mb-6">
                    <span className="text-3xl bg-[var(--bg-light)] w-12 h-12 flex items-center justify-center rounded-xl">{topic.icon}</span>
                    <span className="text-[10px] font-bold bg-[#F1F5F9] dark:bg-[#1E293B] text-[var(--text-secondary)] px-2 py-1 rounded">
                      {topic.count} Qs
                    </span>
                 </div>
                 <h4 className="font-bold text-lg mb-1 text-[var(--text-primary)]">{topic.name}</h4>
                 
                 <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1">
                    <span>Mastery</span>
                    <span className="font-bold">{topic.progress}%</span>
                 </div>
                 <div className="w-full bg-[var(--bg-light)] rounded-full h-1.5">
                    <div className="bg-accent-purple h-1.5 rounded-full" style={{ width: `${topic.progress}%` }}></div>
                 </div>
               </motion.div>
             ))}
          </div>
       </div>

    </div>
  );
};

export default Practice;
