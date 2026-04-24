import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, ChevronDown, CheckCircle, Info, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const subjects = [
  "Indian Polity",
  "Modern History",
  "Geography",
  "Indian Economy",
  "Science & Technology",
  "Current Affairs",
  "General Aptitude"
];

const DailyAiQuestions = () => {
  const [subject, setSubject] = useState(subjects[0]);
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDaily, setFetchingDaily] = useState(true);
  const [revealedAnswers, setRevealedAnswers] = useState({});

  useEffect(() => {
    fetchDailyQuestions();
  }, []);

  const fetchDailyQuestions = async () => {
    setFetchingDaily(true);
    try {
      const res = await axios.get('/api/questions/daily');
      setQuestions(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setFetchingDaily(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setQuestions([]);
    setRevealedAnswers({});
    const loadingToast = toast.loading(`AI is drafting questions for ${subject}...`);
    
    try {
      const res = await axios.post('/api/questions/generate-questions', {
        subject,
        difficulty,
        weakTopics: [] // Could be pulled from user profile analysis
      });
      
      setQuestions(res.data.questions);
      toast.success('Successfully generated 5 new UPSC-style questions!', { id: loadingToast });
    } catch (err) {
      console.error('Generation error:', err);
      toast.error(err.response?.data?.message || 'Failed to generate questions. Groq might be busy.', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (id) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-primary to-primary-light p-8 rounded-2xl text-white shadow-xl overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-secondary" size={20} />
            <span className="text-xs font-bold uppercase tracking-widest text-secondary-light">Powered by Groq LLaMA 3</span>
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2">Daily AI Question Generator</h1>
          <p className="text-blue-100 max-w-md">Generate fresh, UPSC-standard MCQs on any subject. Practice daily to build your streak and master complex concepts.</p>
        </div>
        <div className="shrink-0 relative z-10 flex flex-col gap-3">
          <div className="flex gap-2">
             <select 
               value={subject} 
               onChange={(e) => setSubject(e.target.value)}
               className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary backdrop-blur-md"
             >
               {subjects.map(s => <option key={s} value={s} className="text-gray-900">{s}</option>)}
             </select>
             <select 
               value={difficulty} 
               onChange={(e) => setDifficulty(e.target.value)}
               className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary backdrop-blur-md"
             >
               <option value="easy" className="text-gray-900">Easy</option>
               <option value="medium" className="text-gray-900">Medium</option>
               <option value="hard" className="text-gray-900">Hard</option>
             </select>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="btn bg-secondary hover:bg-secondary-dark text-white font-bold py-3 px-6 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Brain size={20} />}
            {loading ? 'Thinking...' : 'Generate New Set'}
          </button>
        </div>
        {/* Background Decorative Element */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {fetchingDaily && questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
            <Loader2 className="animate-spin mb-4 text-primary" size={40} />
            <p className="font-medium">Loading your daily practice set...</p>
          </div>
        ) : questions.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {questions.map((q, idx) => (
              <motion.div 
                key={q.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card border border-[var(--border)] overflow-hidden group hover:border-primary/30 transition-all"
              >
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-[var(--text-secondary)] px-3 py-1 rounded-full uppercase tracking-wider">
                      Question {idx + 1}
                    </span>
                    <div className="flex gap-2">
                       <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                         q.difficulty === 'hard' ? 'border-red-200 bg-red-50 text-red-600' :
                         q.difficulty === 'medium' ? 'border-amber-200 bg-amber-50 text-amber-600' :
                         'border-green-200 bg-green-50 text-green-600'
                       }`}>
                         {q.difficulty?.toUpperCase()}
                       </span>
                       <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded">
                         {q.category || q.subject}
                       </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-medium mb-8 leading-relaxed text-[var(--text-primary)]">
                    {q.text || q.question}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(q.options || []).map((opt, i) => (
                      <div 
                        key={i}
                        className={`p-4 rounded-xl border-2 border-[var(--border)] flex items-center gap-3 bg-[var(--bg-light)]/30
                          ${revealedAnswers[q.id || idx] && i === q.correct_index ? 'border-green-500 bg-green-50/50' : ''}
                        `}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                          ${revealedAnswers[q.id || idx] && i === q.correct_index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                        `}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-[var(--text-primary)]">{opt}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-[var(--border)] flex flex-col gap-4">
                    <button 
                      onClick={() => toggleAnswer(q.id || idx)}
                      className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors w-fit"
                    >
                      {revealedAnswers[q.id || idx] ? 'Hide Answer & Explanation' : 'Reveal Answer & Explanation'}
                      <ChevronDown className={`transition-transform duration-300 ${revealedAnswers[q.id || idx] ? 'rotate-180' : ''}`} size={16} />
                    </button>

                    <AnimatePresence>
                      {revealedAnswers[q.id || idx] && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-800"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg shrink-0 mt-1">
                              <CheckCircle size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-green-700 dark:text-green-400 mb-1">Correct Answer: {String.fromCharCode(65 + q.correct_index)}</p>
                              <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-line">
                                {q.explanation}
                              </p>
                            </div>
                          </div>
                          {q.sub_topic && (
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                              <Info size={12} />
                              Topic: {q.sub_topic}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="card p-12 text-center border-2 border-dashed border-[var(--border)]">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
              <RefreshCw size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">No questions generated yet</h3>
            <p className="text-[var(--text-secondary)] mb-6">Select a subject above and let Gemini create a custom practice set for you.</p>
            <button onClick={handleGenerate} className="btn btn-primary px-8">Start Generation</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyAiQuestions;
