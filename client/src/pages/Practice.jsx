import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Target, MonitorPlay, Zap, ArrowRight, Brain, Loader2, Landmark, Newspaper, Rocket, Coins, Map, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const baseTopics = [
  { name: 'UPSC & Govt Exams', count: 0, progress: 0, icon: Landmark },
  { name: 'Daily Current Affairs', count: 0, progress: 0, icon: Newspaper },
  { name: 'Science & Technology', count: 0, progress: 0, icon: Rocket },
  { name: 'Business & Finance', count: 0, progress: 0, icon: Coins },
  { name: 'Regional & State GK', count: 0, progress: 0, icon: Map },
  { name: 'Civic & Electoral', count: 0, progress: 0, icon: Scale },
];

const Practice = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testsTaken, setTestsTaken] = useState(0);
  const [topics, setTopics] = useState(baseTopics);
  const [aiHistory, setAiHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [dashRes, countRes, historyRes] = await Promise.all([
          axios.get('/api/dashboard'),
          axios.get('/api/questions/counts-by-category'),
          axios.get('/api/questions/ai-history')
        ]);
        
        setTestsTaken(dashRes.data.testsTaken || 0);
        setAiHistory(historyRes.data || []);
        
        const dbCounts = countRes.data;
        setTopics(prev => prev.map(t => ({
          ...t,
          count: dbCounts[t.name] || 0,
        })));
      } catch (err) {
        console.error('Error fetching practice data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // BUG 9 FIX: Fetch a real drill test from the API, then navigate to it
  const handleStartDrill = async () => {
    setIsGenerating(true);
    const loadToast = toast.loading("AI is analyzing your weak areas...");
    try {
      const res = await axios.get('/api/practice/drill');
      toast.dismiss(loadToast);

      if (res.data && res.data.questions && res.data.questions.length > 0) {
        toast.success(`AI Drill ready! Focusing on: ${res.data.topic}`);
        // Navigate to a special drill route or just TestInterface with state
        navigate(`/test/drill`, { 
          state: { 
            questions: res.data.questions, 
            title: `AI Drill: ${res.data.topic}`,
            isDrill: true 
          } 
        });
      } else {
        toast.success("Head to the tests section to start practicing!");
        navigate('/tests');
      }
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error("Failed to start AI drill. Please try from the Tests page.");
      navigate('/tests');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComingSoon = () => {
    toast("Feature coming soon", { icon: <Rocket size={16} className="text-primary" /> });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-10">
       
       <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary to-primary-light flex-1 p-8 text-white flex items-center justify-between overflow-hidden relative">
             <div className="relative z-10 w-2/3">
                <h2 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2"><Target size={28}/> AI Drill Mode</h2>
                <p className="text-gray-200 text-sm mb-6">Our AI analyzes your weak subjects and generates a custom rapid drill specifically for you.</p>
                <button 
                  onClick={handleStartDrill} 
                  disabled={isGenerating}
                  className="btn bg-white text-primary hover:bg-gray-100 font-bold px-6 py-2 shadow-lg flex items-center gap-2"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                  {isGenerating ? "Analyzing..." : "Start AI Drill"}
                </button>
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
              {topics.map((topic, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  onClick={() => navigate(`/tests?category=${encodeURIComponent(topic.name)}`)}
                  className="card p-6 hover:shadow-lg transition-shadow cursor-pointer border border-[var(--border)] hover:border-accent-purple"
                >
                 <div className="flex justify-between items-start mb-6">
                    <span className="text-primary bg-[var(--bg-light)] w-12 h-12 flex items-center justify-center rounded-xl">
                      <topic.icon size={24} />
                    </span>
                    <span className="text-[10px] font-bold bg-[#F1F5F9] dark:bg-[#1E293B] text-[var(--text-secondary)] px-2 py-1 rounded">
                      {isLoading ? 'Loading...' : `${topic.count} Qs`}
                    </span>
                 </div>
                 <h4 className="font-bold text-lg mb-1 text-[var(--text-primary)]">{topic.name}</h4>
                 
                 <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1">
                    <span>Available Questions</span>
                    <span className="font-bold">{isLoading ? '...' : topic.count}</span>
                 </div>
                 <div className="w-full bg-[var(--bg-light)] rounded-full h-1.5">
                    <div className="bg-accent-purple h-1.5 rounded-full" style={{ width: `${Math.min((topic.count / 50) * 100, 100)}%` }}></div>
                 </div>
               </motion.div>
              ))}
          </div>
       </div>

       {/* AI Generated History Integration */}
       <div className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-2xl flex items-center gap-2">
               <Brain className="text-secondary" /> AI Generated Practice
            </h3>
            <button onClick={() => navigate('/ai-practice')} className="text-sm font-bold text-secondary hover:underline">Manage All History</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {aiHistory.length > 0 ? (
               aiHistory.slice(0, 4).map((set, i) => (
                 <div 
                   key={set.id}
                   onClick={() => navigate('/ai-practice')} // Simplified, as it loads in the AI page
                   className="card p-5 border-2 border-[var(--border)] hover:border-secondary/30 transition-all cursor-pointer flex justify-between items-center group"
                 >
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">{set.category}</span>
                       <h4 className="font-bold group-hover:text-secondary transition-colors">Custom AI Set #{aiHistory.length - i}</h4>
                       <p className="text-[10px] text-[var(--text-secondary)] mt-1">{new Date(set.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-1 rounded uppercase">{set.difficulty}</span>
                       <span className="text-[10px] font-bold text-[var(--text-secondary)] flex items-center gap-1"><Zap size={10}/> Attempt Again</span>
                    </div>
                 </div>
               ))
             ) : (
               <div className="col-span-2 card p-8 border-dashed border-2 border-[var(--border)] text-center">
                  <p className="text-[var(--text-secondary)] text-sm mb-4 italic">You haven't generated any custom AI sets yet.</p>
                  <button onClick={() => navigate('/ai-practice')} className="btn btn-secondary btn-sm px-6">Generate Your First Set</button>
               </div>
             )}
          </div>
       </div>

    </div>
  );
};

export default Practice;
