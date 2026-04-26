import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, ChevronDown, CheckCircle, Info, Loader2, RefreshCw } from 'lucide-react';
import ProUpgradeModal from '../components/ProUpgradeModal';

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
  const [userSelections, setUserSelections] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('ai_session');
    if (savedSession) {
      try {
        const { questions: savedQs, selections, revealed, sub, diff } = JSON.parse(savedSession);
        if (savedQs && savedQs.length > 0) {
          setQuestions(savedQs);
          setUserSelections(selections || {});
          setRevealedAnswers(revealed || {});
          setSubject(sub || subjects[0]);
          setDifficulty(diff || 'medium');
          setFetchingDaily(false); // Skip initial fetch if session exists
          return;
        }
      } catch (e) {
        console.error('Failed to load AI session', e);
      }
    }
    fetchDailyQuestions();
  }, []);

  // Save session to localStorage
  useEffect(() => {
    if (questions.length > 0 && !isCompleted) {
      const session = {
        questions,
        selections: userSelections,
        revealed: revealedAnswers,
        sub: subject,
        diff: difficulty
      };
      localStorage.setItem('ai_session', JSON.stringify(session));
    }
  }, [questions, userSelections, revealedAnswers, isCompleted]);

  const fetchDailyQuestions = async () => {
    setFetchingDaily(true);
    try {
      const res = await axios.get('/api/questions/daily', {
        params: { subject, difficulty }
      });
      setQuestions(res.data);
      setIsCompleted(false);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setFetchingDaily(false);
    }
  };

  const handleGenerate = async () => {
    // Check if current set is incomplete
    const answeredCount = Object.keys(userSelections).length;
    if (questions.length > 0 && answeredCount < questions.length && !isCompleted) {
      return toast.error("Please complete your current set before generating a new one!");
    }

    setLoading(true);
    setRevealedAnswers({});
    setUserSelections({});
    setIsCompleted(false);
    const loadingToast = toast.loading(`AI is drafting fresh questions for ${subject}...`);
    
    try {
      const res = await axios.post('/api/questions/generate-questions', {
        subject,
        difficulty,
        weakTopics: [] 
      });
      
      setQuestions(res.data.questions);
      toast.success('Successfully generated 5 new UPSC-style questions!', { id: loadingToast });
    } catch (err) {
      console.error('Generation error:', err);
      if (err.response?.data?.code === 'AI_LIMIT_REACHED') {
        setShowUpgradeModal(true);
        toast.dismiss(loadingToast);
      } else {
        toast.error(err.response?.data?.message || 'Failed to generate questions.', { id: loadingToast });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qId, optionIdx, correctIdx) => {
    if (userSelections[qId] !== undefined || isCompleted) return; // Prevent re-selection

    setUserSelections(prev => ({
      ...prev,
      [qId]: optionIdx
    }));

    // Auto-reveal explanation after selection
    setRevealedAnswers(prev => ({
      ...prev,
      [qId]: true
    }));

    if (optionIdx === correctIdx) {
      toast.success("Correct Answer!");
    } else {
      toast.error("Incorrect Answer.");
    }
  };

  const handleCompleteSet = () => {
    setIsCompleted(true);
    localStorage.removeItem('ai_session');
    toast.success("Great job! Practice set completed.", {
      icon: '🎉',
      duration: 4000
    });
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
          <h1 className="text-3xl font-heading font-bold mb-2">AI Question Lab</h1>
          <p className="text-blue-100 max-w-md">Practice with high-quality MCQs tailored to your goal. Select an answer to see immediate feedback.</p>
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
            {loading ? 'Generating...' : 'Generate Fresh Set'}
          </button>
        </div>
        {/* Background Decorative Element */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
            <RefreshCw size={14} className={fetchingDaily ? 'animate-spin' : ''} /> 
            {fetchingDaily ? 'Syncing questions...' : `Showing Recent ${subject} Sets`}
          </h2>
        </div>

        {fetchingDaily && questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
            <Loader2 className="animate-spin mb-4 text-primary" size={40} />
            <p className="font-medium">Curating your knowledge path...</p>
          </div>
        ) : questions.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {questions.map((q, idx) => {
              const selectedIdx = userSelections[q.id];
              const isCorrect = selectedIdx === q.correct_index;
              const hasAnswered = selectedIdx !== undefined;

              return (
                <motion.div 
                  key={q.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card border-2 transition-all duration-300 ${
                    hasAnswered 
                      ? isCorrect 
                        ? 'border-green-500/30 bg-green-50/10' 
                        : 'border-red-500/30 bg-red-50/10'
                      : 'border-[var(--border)] group hover:border-primary/30'
                  }`}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-[var(--text-secondary)] px-3 py-1 rounded-full uppercase tracking-wider">
                          Q-{idx + 1}
                        </span>
                        {hasAnswered && (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                          </span>
                        )}
                      </div>
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
                      {(q.options || []).map((opt, i) => {
                        const isOptionSelected = selectedIdx === i;
                        const isThisCorrect = i === q.correct_index;
                        
                        let optionClass = "border-[var(--border)] bg-[var(--bg-light)]/30 hover:border-primary/50 cursor-pointer";
                        let badgeClass = "bg-gray-200 text-gray-500";

                        if (hasAnswered) {
                          optionClass = "cursor-default opacity-80";
                          if (isThisCorrect) {
                            optionClass = "border-green-500 bg-green-500 text-white opacity-100 shadow-md scale-[1.02]";
                            badgeClass = "bg-white text-green-600";
                          } else if (isOptionSelected) {
                            optionClass = "border-red-500 bg-red-500 text-white opacity-100 shadow-md";
                            badgeClass = "bg-white text-red-600";
                          }
                        }

                        return (
                          <div 
                            key={i}
                            onClick={() => handleOptionSelect(q.id, i, q.correct_index)}
                            className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all duration-200 ${optionClass}`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${badgeClass}`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span className="font-medium">{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8 pt-8 border-t border-[var(--border)] flex flex-col gap-4">
                      <button 
                        onClick={() => toggleAnswer(q.id)}
                        className={`flex items-center gap-2 text-sm font-bold transition-colors w-fit ${hasAnswered ? 'text-primary' : 'text-gray-400 opacity-50'}`}
                      >
                        {revealedAnswers[q.id] ? 'Hide Explanation' : 'View Explanation'}
                        <ChevronDown className={`transition-transform duration-300 ${revealedAnswers[q.id] ? 'rotate-180' : ''}`} size={16} />
                      </button>

                      <AnimatePresence>
                        {revealedAnswers[q.id] && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-blue-50/30 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-800"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0 mt-1">
                                <Info size={18} />
                              </div>
                              <div>
                                <p className="font-bold text-primary mb-1">Detailed Explanation</p>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-line">
                                  {q.explanation}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="card p-12 text-center border-2 border-dashed border-[var(--border)]">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
              <RefreshCw size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">No sets found for {subject}</h3>
            <p className="text-[var(--text-secondary)] mb-6">Hit the button above to generate a custom {difficulty} set using AI.</p>
            <button onClick={handleGenerate} className="btn btn-primary px-8">Generate Now</button>
          </div>
        )}

        <ProUpgradeModal 
          isOpen={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)} 
          feature="ai"
        />

        {/* Completion Footer */}
        {questions.length > 0 && !isCompleted && Object.keys(userSelections).length === questions.length && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl text-center mt-12"
          >
            <CheckCircle className="mx-auto mb-4" size={48} />
            <h3 className="text-2xl font-heading font-bold mb-2">You've finished the set!</h3>
            <p className="text-green-50 mb-6">Review your performance above or click below to finalize this session.</p>
            <button 
              onClick={handleCompleteSet}
              className="bg-white text-green-600 hover:bg-green-50 font-bold py-3 px-10 rounded-xl transition-all shadow-lg active:scale-95"
            >
              Complete Practice Set
            </button>
          </motion.div>
        )}

        {isCompleted && (
          <div className="card p-8 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 text-center mt-12">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-2">Practice Set Completed!</h3>
            <p className="text-blue-600 dark:text-blue-400 mb-6">Ready for more? Generate a new set using the button at the top.</p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn btn-primary"
            >
              Back to Top
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyAiQuestions;
