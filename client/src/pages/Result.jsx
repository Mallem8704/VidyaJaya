import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle, XCircle, Clock, ChevronRight, Share2, Award } from 'lucide-react';

const mockTopicData = [
  { name: 'Polity', score: 80, fill: '#00C853' },
  { name: 'History', score: 60, fill: '#FF6B00' },
  { name: 'Geography', score: 70, fill: '#FF6B00' },
  { name: 'Economy', score: 40, fill: '#EF4444' },
  { name: 'Science', score: 90, fill: '#00C853' },
];

const Result = () => {
  const { id } = useParams();

  // Progress Circle computation
  const percentage = 72;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12 mt-4 px-4 overflow-x-hidden">
      
      <div className="flex justify-between items-center bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <Link to="/dashboard" className="text-[var(--text-secondary)] hover:text-primary flex items-center gap-1 font-medium text-sm transition-colors">
          <ChevronRight className="rotate-180" size={16} /> Back to Dashboard
        </Link>
        <div className="flex gap-3">
          <button className="btn btn-outline text-sm py-1.5 px-3 flex gap-2"><Share2 size={16}/> Share</button>
          <button className="btn btn-primary text-sm py-1.5 px-3">Retake</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Score Hero */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden bg-primary text-white"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary blur-3xl opacity-30 rounded-full"></div>
            <h2 className="text-xl font-heading font-medium mb-6 text-gray-200">UPSC Mock Set #47</h2>
            
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              <svg className="transform -rotate-90 w-40 h-40">
                <circle cx="80" cy="80" r="60" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="transparent" />
                <motion.circle 
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="80" cy="80" r="60" stroke="#FF6B00" strokeWidth="12" fill="transparent"
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-heading font-bold">{percentage}%</span>
                <span className="text-xs text-gray-300">Score</span>
              </div>
            </div>

            <p className="text-lg font-medium">Great performance!</p>
            <p className="text-sm text-gray-300 px-4 mt-2">You scored better than 68% of students in this test.</p>
            
            <div className="mt-8 bg-[rgba(0,0,0,0.2)] rounded-xl p-4 w-full flex justify-between items-center border border-[rgba(255,255,255,0.1)]">
               <div>
                  <div className="text-xs text-gray-400">Coins Earned</div>
                  <div className="text-xl font-bold text-accent-gold flex items-center gap-1"><Award size={18}/> +25</div>
               </div>
               <div className="text-right">
                  <div className="text-xs text-gray-400">Global Rank</div>
                  <div className="text-xl font-bold">#342</div>
               </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4 border flex flex-col items-center text-center bg-green-50 border-green-100 dark:bg-[#062111] dark:border-green-900">
               <CheckCircle size={28} className="text-accent-green mb-2" />
               <div className="text-2xl font-bold mb-1 text-[var(--text-primary)]">72</div>
               <div className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide">Correct</div>
            </div>
            <div className="card p-4 border flex flex-col items-center text-center bg-red-50 border-red-100 dark:bg-[#250d0d] dark:border-red-900">
               <XCircle size={28} className="text-red-500 mb-2" />
               <div className="text-2xl font-bold mb-1 text-[var(--text-primary)]">18</div>
               <div className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide">Wrong</div>
            </div>
            <div className="card p-4 border flex flex-col items-center text-center bg-gray-50 dark:bg-[#151c27]">
               <div className="text-xl mb-2">⏭️</div>
               <div className="text-2xl font-bold mb-1 text-[var(--text-primary)]">10</div>
               <div className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide">Skipped</div>
            </div>
            <div className="card p-4 border flex flex-col items-center text-center bg-blue-50 dark:bg-[#07192a] border-blue-100 dark:border-primary">
               <Clock size={28} className="text-primary-light mb-2" />
               <div className="text-xl font-bold mb-1 text-[var(--text-primary)]">1h 43m</div>
               <div className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide">Time</div>
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Review */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Insights Card */}
          <div className="card p-6 bg-gradient-to-br from-[#0B1120] to-primary border-l-4 border-accent-purple shadow-xl">
             <div className="flex items-center gap-3 mb-4">
                <span className="p-2 bg-accent-purple bg-opacity-20 rounded-lg text-accent-purple shrink-0">🤖</span>
                <h3 className="font-heading font-bold text-xl text-white">AI Performance Insight</h3>
             </div>
             <p className="text-gray-300 leading-relaxed text-[15px] mb-6">
                Your strongest area is <strong className="text-white">Science & Technology</strong>. Focus more on <strong className="text-red-400">Economy</strong> — you got only 40% there. Your answering speed is excellent (avg 62 sec/question).
                <br/><br/>
                <span className="text-accent-gold font-medium">Recommended:</span> Practice 20 Economy questions daily for the next 7 days.
             </p>
             <Link to="/analysis" className="btn bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.2)] text-sm px-5 py-2">
               Get Complete AI Plan
             </Link>
          </div>

          {/* Topic Brekdown Chart */}
          <div className="card p-6">
            <h3 className="font-heading font-bold text-xl mb-6">Topic-Wise Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockTopicData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--text-primary)', fontWeight: 500}} width={80} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                     {mockTopicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Answer Key Preview */}
          <div className="card">
             <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                <h3 className="font-heading font-bold text-xl">Answer Key Preview</h3>
                <span className="text-xs font-bold bg-primary text-white px-3 py-1 rounded-full">PRO features</span>
             </div>
             <div className="divide-y divide-[var(--border)]">
               
               {[1, 2, 3].map(q => (
                 <div key={q} className="p-6 hover:bg-[var(--bg-light)] transition-colors">
                    <div className="flex gap-4">
                       <span className="font-bold flex-shrink-0 w-8">Q{q}.</span>
                       <div>
                          <p className="font-medium mb-4">The 'Directive Principles of State Policy' in the Indian Constitution are inspired by the constitution of which country?</p>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                             <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-[var(--bg-card)]">A) USA</div>
                             <div className="p-3 rounded border border-green-500 bg-green-50 dark:bg-[rgba(0,255,0,0.1)] text-green-700 dark:text-green-400 font-bold flex justify-between items-center">
                               B) Ireland <CheckCircle size={18}/>
                             </div>
                             <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-[var(--bg-card)] text-gray-500 opacity-50">C) UK</div>
                             <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-[var(--bg-card)] text-gray-500 opacity-50">D) Canada</div>
                          </div>
                          <div className="bg-blue-50 dark:bg-[rgba(59,130,246,0.1)] p-4 rounded-xl text-sm border border-blue-100 dark:border-blue-900 inline-block w-full">
                            <span className="font-bold text-blue-800 dark:text-blue-400 block mb-1">Explanation:</span>
                            The Directive Principles of State Policy are inspired by the Irish Constitution, which had copied it from the Spanish Constitution.
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
               
             </div>
             <div className="p-4 text-center bg-[var(--bg-light)] rounded-b-custom">
               <button className="text-secondary font-bold text-sm hover:underline">View All 100 Explanations →</button>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Result;
