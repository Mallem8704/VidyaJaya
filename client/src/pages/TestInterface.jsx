import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, Target, Award, Timer, ShieldAlert, Zap, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const TestInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // --- STATE ---
  const [testStarted, setTestStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [testData, setTestData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingTest, setLoadingTest] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [finalResultId, setFinalResultId] = useState(null);
  const [warningCount, setWarningCount] = useState(0);

  const qStartTimeRef = useRef(null);
  const totalStartTimeRef = useRef(null);

  // --- PROCTORING: TAB PROTECTION ---
  useEffect(() => {
    if (!testStarted || finished) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount(prev => {
          const next = prev + 1;
          if (next >= 3) {
            toast.error("⚠️ Multiple tab switches detected. Auto-submitting test!");
            handleSubmit();
          } else {
            toast.error(`⚠️ Warning (${next}/3): Please do not leave the test screen.`);
          }
          return next;
        });
      }
    };

    const handleBlur = () => {
      // Small timeout to allow for system alerts without triggering warning
      setTimeout(() => {
        if (!document.hasFocus() && testStarted && !finished) {
          handleVisibilityChange();
        }
      }, 500);
    };

    const preventAbuse = (e) => {
      if (testStarted) {
        e.preventDefault();
        toast.error("Content copying is disabled during the test.");
      }
    };

    const preventKeys = (e) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+U, F12
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u')) || 
        e.key === 'F12'
      ) {
        e.preventDefault();
        toast.error("Shortcut disabled for security.");
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('contextmenu', preventAbuse);
    window.addEventListener('copy', preventAbuse);
    window.addEventListener('keydown', preventKeys);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('contextmenu', preventAbuse);
      window.removeEventListener('copy', preventAbuse);
      window.removeEventListener('keydown', preventKeys);
    };
  }, [testStarted, finished]);

  // --- AUTH CHECK ---
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to attempt tests.");
      navigate('/login');
    } else {
      fetchTestDetails();
    }
  }, [isAuthenticated, navigate, id]);

  const fetchTestDetails = async () => {
    try {
      const res = await axios.get(`/api/tests/${id}`);
      setTestData(res.data);
      setQuestions(res.data.questions);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load test. Returning to dashboard.");
      navigate('/dashboard');
    } finally {
      setLoadingTest(false);
    }
  };

  // --- TIMER ---
  useEffect(() => {
    if (!testStarted || finished || isLocked) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, finished, currentIdx, isLocked]);

  // --- ACTIONS ---
  const handleStart = async () => {
    try {
      // Fullscreen enforcement
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      
      setTestStarted(true);
      setCurrentIdx(0);
      setScore(0);
      setWarningCount(0);
      setAnswers([]);
      setTimeLeft(15);
      totalStartTimeRef.current = Date.now();
      qStartTimeRef.current = Date.now();
    } catch (err) {
      toast.error("Test requires Fullscreen mode to ensure integrity.");
      console.error(err);
    }
  };

  const handleTimeout = () => {
    const q = questions[currentIdx];
    setAnswers(prev => [...prev, {
      questionId: q.id,
      selectedIndex: -1,
      timeTaken: 15000 // ms
    }]);
    moveToNext();
  };

  const handleSelectOption = (idx) => {
    if (isLocked) return;
    setIsLocked(true);

    const now = Date.now();
    const elapsed = now - qStartTimeRef.current;
    const q = questions[currentIdx];
    const isCorrect = idx === q.correct_index;

    // Local UI Score Update (for immediate feedback)
    let points = 0;
    if (isCorrect) {
      points += 10;
      if (elapsed < 5000) points += 5;
    } else {
      points -= 0; // No negative marking for wrong, but -2 for skip (timeout)
    }

    setScore(prev => prev + points);
    setAnswers(prev => [...prev, {
      questionId: q.id,
      selectedIndex: idx,
      timeTaken: elapsed
    }]);

    setTimeout(() => {
      moveToNext();
      setIsLocked(false);
    }, 300);
  };

  const moveToNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(15);
      qStartTimeRef.current = Date.now();
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setTestStarted(false);
    
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    
    try {
      const res = await axios.post('/api/submissions', {
        testId: id,
        answers: answers
      });

      setFinalResultId(res.data.id);
      setFinished(true);
      toast.success(`Submission Successful! +${res.data.coinsEarned} Coins Earned.`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit test.");
      setFinished(true); // Still show results locally if possible
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDERING ---
  if (loadingTest) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)] flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <h1 className="text-2xl font-bold animate-pulse">Initializing Test...</h1>
      </div>
    );
  }

  if (!testStarted && !finished) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card max-w-md w-full p-10 text-center shadow-2xl">
          <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <ShieldAlert className="text-orange-500" size={48} />
          </div>
          <h1 className="text-3xl font-black mb-4">{testData?.title || 'Daily Mock Test'}</h1>
          <p className="text-[var(--text-secondary)] mb-8">
            {questions.length} Questions • Integrity Protection Active
          </p>
          
          <div className="bg-rose-50 dark:bg-rose-900/10 rounded-2xl p-6 mb-8 border border-rose-200 dark:border-rose-900/50 text-left space-y-3">
            <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm flex items-center gap-2">
              <ShieldAlert size={16} /> Anti-Cheat Rules:
            </h4>
            <ul className="text-xs text-rose-600 dark:text-rose-500 list-disc pl-4 space-y-1">
              <li>Test will run in **Full Screen** mode.</li>
              <li>Switching tabs or minimizing window will trigger a warning.</li>
              <li>3 Warnings will lead to **Automatic Submission**.</li>
              <li>Right-click and Copy-Paste are disabled.</li>
            </ul>
          </div>

          <button onClick={handleStart} className="btn btn-primary w-full py-4 text-lg font-black shadow-lg">
            ENTER SECURE MODE
          </button>
        </motion.div>
      </div>
    );
  }

  if (testStarted) {
    const q = questions[currentIdx];
    return (
      <div className="min-h-screen bg-[var(--bg-light)] flex flex-col select-none">
        <header className="h-20 bg-[var(--bg-card)] border-b border-[var(--border)] px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Question</div>
            <div className="w-12 h-12 bg-[var(--bg-light)] rounded-xl flex items-center justify-center font-black text-xl border border-[var(--border)]">
              {currentIdx + 1}
            </div>
          </div>

          <div className={`flex items-center gap-2 px-6 py-2 rounded-full font-black text-2xl transition-all ${timeLeft <= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-500 text-white shadow-orange-500/20 shadow-lg'}`}>
            <Clock size={24} />
            {timeLeft}s
          </div>

          <div className="text-right">
            <div className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Score</div>
            <div className="text-2xl font-black text-orange-500">{score}</div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={currentIdx} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-10">
              <div className="text-center">
                <span className="px-4 py-1.5 bg-primary/10 text-primary text-xs font-black rounded-full border border-primary/20 uppercase tracking-tighter">
                  {q.category}
                </span>
                <h2 className="text-3xl md:text-5xl font-black mt-6 leading-tight">
                  {q.text}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    disabled={isLocked}
                    onClick={() => handleSelectOption(i)}
                    className="group relative p-6 bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-3xl text-left transition-all hover:border-orange-500 hover:shadow-2xl active:scale-95 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-light)] flex items-center justify-center font-black text-xl text-[var(--text-secondary)] group-hover:bg-orange-500 group-hover:text-white transition-all">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-xl font-bold">{opt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
        
        <footer className="h-16 flex items-center justify-center text-[var(--text-secondary)] text-sm font-bold gap-2">
          <ShieldAlert size={16} className="text-red-500" />
          Stay focused. Tab switching will invalidate your result.
        </footer>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)] flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 border-8 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <h1 className="text-3xl font-black animate-pulse">Calculating Score...</h1>
        <p className="text-[var(--text-secondary)]">Analyzing your performance across sectors</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card max-w-2xl w-full p-12 text-center shadow-2xl border-4 border-orange-500/20">
        <div className="w-24 h-24 bg-orange-500 text-white rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-500/40">
          <Award size={56} />
        </div>
        <h1 className="text-5xl font-black mb-4">Test Complete!</h1>
        <p className="text-xl text-[var(--text-secondary)] mb-12 italic">"Precision is the key to UPSC success."</p>

        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="p-8 bg-[var(--bg-light)] rounded-[32px] border border-[var(--border)]">
            <div className="text-4xl font-black text-orange-500">{score}</div>
            <div className="text-xs font-black uppercase text-[var(--text-secondary)] mt-2">XP Points</div>
          </div>
          <div className="p-8 bg-[var(--bg-light)] rounded-[32px] border border-[var(--border)]">
            <div className="text-4xl font-black text-blue-500">{(answers.filter(a => a.selectedIndex !== -1).length / questions.length) * 100}%</div>
            <div className="text-xs font-black uppercase text-[var(--text-secondary)] mt-2">Participation</div>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-4">
            <button onClick={() => navigate('/dashboard')} className="flex-1 btn btn-outline py-5 text-lg font-black">
              GO TO DASHBOARD
            </button>
            <button 
              onClick={() => finalResultId && navigate(`/result/${finalResultId}`)} 
              disabled={!finalResultId}
              className={`flex-1 btn py-5 text-lg font-black ${!finalResultId ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary'}`}
            >
              {finalResultId ? 'DETAILED ANALYSIS' : 'SAVING RESULT...'}
            </button>
          </div>
          
          {!finalResultId && !submitting && (
            <button 
              onClick={handleSubmit}
              className="text-orange-500 font-bold hover:underline flex items-center justify-center gap-2"
            >
              <ShieldAlert size={16} /> Save failed. Click here to Retry Saving
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TestInterface;
