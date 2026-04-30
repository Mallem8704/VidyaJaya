import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, ChevronDown, CheckCircle, Info, Loader2, RefreshCw, History, PlayCircle, Clock } from 'lucide-react';
import ProUpgradeModal from '../components/ProUpgradeModal';
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
  const [activeTab, setActiveTab] = useState('practice'); // 'practice' or 'history'
  const [subject, setSubject] = useState(subjects[0]);
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDaily, setFetchingDaily] = useState(true);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [userSelections, setUserSelections] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentSetId, setCurrentSetId] = useState(null);

  // Load session or fetch daily on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('ai_session');
    if (savedSession) {
      try {
        const { questions: savedQs, selections, revealed, sub, diff, setId } = JSON.parse(savedSession);
        if (savedQs && savedQs.length > 0) {
          setQuestions(savedQs);
          setUserSelections(selections || {});
          setRevealedAnswers(revealed || {});
          setSubject(sub || subjects[0]);
          setDifficulty(diff || 'medium');
          setCurrentSetId(setId || null);
          setFetchingDaily(false);
          return;
        }
      } catch (e) {
        console.error('Failed to load AI session', e);
      }
    }
    fetchDailyQuestions();
  }, []);

  // Fetch history when history tab is clicked
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setFetchingHistory(true);
    try {
      const res = await axios.get('/api/questions/ai-history');
      setHistory(res.data);
    } catch (err) {
      console.error('History error:', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const loadFromHistory = async (setId) => {
    const loadingToast = toast.loading('Loading your custom set...');
    try {
      const res = await axios.get(`/api/questions/ai-set/${setId}`);
      setQuestions(res.data.questions);
      setCurrentSetId(setId);
      setUserSelections({});
      setRevealedAnswers({});
      setIsCompleted(false);
      setActiveTab('practice');
      toast.success('Practice set loaded!', { id: loadingToast });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error('Failed to load practice set.', { id: loadingToast });
    }
  };

  // Save session to localStorage
  useEffect(() => {
    if (questions.length > 0 && !isCompleted) {
      const session = {
        questions,
        selections: userSelections,
        revealed: revealedAnswers,
        sub: subject,
        diff: difficulty,
        setId: currentSetId
      };
      localStorage.setItem('ai_session', JSON.stringify(session));
    }
  }, [questions, userSelections, revealedAnswers, isCompleted, currentSetId]);

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
      if (res.data.setId) {
        setCurrentSetId(res.data.setId);
      }
      toast.success('Successfully generated 5 new UPSC-style questions!', { id: loadingToast });
    } catch (err) {
      console.error('Generation error:', err);
      
      if (err.response?.data?.code === 'AI_LIMIT_REACHED') {
        setShowUpgradeModal(true);
        toast.dismiss(loadingToast);
      } else if (err.response?.status === 409) {
        toast.error('You recently generated a similar set. Checking history...', { id: loadingToast });
        setActiveTab('history');
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

  const handleCompleteSet = async () => {
    const loadingToast = toast.loading("Saving your practice result...");
    try {
      if (currentSetId) {
        // Format answers for backend
        const formattedAnswers = Object.entries(userSelections).map(([qId, index]) => ({
          questionId: qId,
          selectedIndex: index,
          timeTaken: 15000 // default for untimed AI tests
        }));

        await axios.post('/api/submissions', {
          aiSetId: currentSetId,
          answers: formattedAnswers
        });
        toast.success("Practice set saved to Leaderboard!", { id: loadingToast, icon: <CheckCircle className="text-green-500" /> });
      } else {
        toast.success("Great job! Practice set completed.", { id: loadingToast, icon: <CheckCircle className="text-green-500" /> });
      }

      setIsCompleted(true);
      localStorage.removeItem('ai_session');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save practice result", { id: loadingToast });
      setIsCompleted(true); // Let them proceed anyway
      localStorage.removeItem('ai_session');
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
      {/* Header Section with Tabs */}
      <div className="bg-gradient-to-br from-primary to-primary-dark p-1 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="flex p-1 bg-white/10 backdrop-blur-md rounded-xl m-4 relative z-10">
          <button 
            onClick={() => setActiveTab('practice')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${activeTab === 'practice' ? 'bg-white text-primary shadow-lg' : 'text-white hover:bg-white/5'}`}
          >
            <Brain size={18} /> AI Lab
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${activeTab === 'history' ? 'bg-white text-primary shadow-lg' : 'text-white hover:bg-white/5'}`}
          >
            <History size={18} /> Practice History
          </button>
        </div>

        {activeTab === 'practice' ? (
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-8 text-white relative z-10 pt-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-secondary" size={20} />
                <span className="text-xs font-bold uppercase tracking-widest text-secondary-light">Powered by Groq LLaMA 3</span>
              </div>
              <h1 className="text-3xl font-heading font-bold mb-2">AI Question Lab</h1>
              <p className="text-blue-100 max-w-md">Practice with high-quality MCQs tailored to your goal. Select an answer to see immediate feedback.</p>
            </div>
            <div className="shrink-0 flex flex-col gap-3">
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
          </div>
        ) : (
          <div className="p-8 text-white relative z-10 pt-2 text-center md:text-left">
            <h1 className="text-3xl font-heading font-bold mb-2">Practice History</h1>
            <p className="text-blue-100">Review and retake your custom AI-generated sets.</p>
          </div>
        )}
        
        {/* Background Decorative Element */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {activeTab === 'practice' ? (
        /* Practice View - Existing Questions List */
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
            <>
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
                      className={`card border-2 transition-all duration-300 mb-6 ${
                        hasAnswered 
                          ? isCorrect 
                            ? 'border-green-500/30 bg-green-50/10' 
                            : 'border-red-500/30 bg-red-50/10'
                          : 'border-[var(--border)] group hover:border-primary/30'
                      }`}
                    >
                      <div className="p-6 md:p-8">
                        {/* Question Content */}
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
            </>
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
        </div>
      ) : (
        /* History View */
        <div className="space-y-4 animate-slide-up">
          {fetchingHistory ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
              <Loader2 className="animate-spin mb-4 text-primary" size={40} />
              <p className="font-medium">Retrieving your practice history...</p>
            </div>
          ) : history.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((set) => (
                <motion.div 
                  key={set.id}
                  whileHover={{ y: -2 }}
                  className="card p-6 border-2 border-[var(--border)] hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => loadFromHistory(set.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{set.category}</span>
                      <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                        Custom AI Set
                      </h4>
                    </div>
                    <div className={`text-[10px] font-bold px-2 py-1 rounded border ${
                      set.difficulty === 'hard' ? 'border-red-200 bg-red-50 text-red-600' :
                      set.difficulty === 'medium' ? 'border-amber-200 bg-amber-50 text-amber-600' :
                      'border-green-200 bg-green-50 text-green-600'
                    }`}>
                      {set.difficulty?.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} />
                      {new Date(set.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1.5 text-primary font-bold">
                      <PlayCircle size={14} />
                      Resume Practice
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center border-2 border-dashed border-[var(--border)]">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <History size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">No history yet</h3>
              <p className="text-[var(--text-secondary)] mb-6">Generated AI sets will automatically appear here for review.</p>
              <button onClick={() => setActiveTab('practice')} className="btn btn-primary px-8">Start Practicing</button>
            </div>
          )}
        </div>
      )}

      <ProUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        feature="ai"
      />
    </div>
  );
};

export default DailyAiQuestions;
