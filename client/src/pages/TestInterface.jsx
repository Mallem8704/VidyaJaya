import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Bookmark, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const TestInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);

  // answers: { qIndex: optionIndex } — -1 means deliberately skipped
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);

  // Per-question timer
  const [qTimeLeft, setQTimeLeft] = useState(30);
  const qStartTimeRef = useRef(Date.now());
  // Store time taken per question in ms: { qIndex: ms }
  const timeTakenRef = useRef({});

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load test data
  useEffect(() => {
    if (location.state?.questions) {
      setTest({ 
        title: location.state.title || 'AI Drill Session',
        duration: 1800, // 30 mins for drill
        category: 'AI Drill'
      });
      setQuestions(location.state.questions);
      setTimeLeft(1800);
      setLoading(false);
      return;
    }

    const fetchTestData = async () => {
      if (id === 'drill') {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`/api/tests/${id}`);
        setTest(res.data);
        setQuestions(res.data.questions || []);
        setTimeLeft(res.data.duration || 7200);
      } catch (err) {
        console.error('Error fetching test data:', err);
        toast.error('Failed to load test questions');
      } finally {
        setLoading(false);
      }
    };
    fetchTestData();
  }, [id, location.state]);

  // Overall countdown timer
  useEffect(() => {
    if (loading) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading]);

  // Per-question countdown (30s)
  useEffect(() => {
    if (loading || showConfirmModal) return;
    qStartTimeRef.current = Date.now();
    setQTimeLeft(30);

    const qTimer = setInterval(() => {
      setQTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-advance: record as skipped if no answer
          recordTimeForCurrent();
          goToNext(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(qTimer);
  }, [loading, currentIdx, showConfirmModal]);

  // Anti-cheat
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.error('⚠️ Anti-Cheat: Do not leave the test tab!', { duration: 5000 });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const recordTimeForCurrent = useCallback(() => {
    const elapsed = Date.now() - qStartTimeRef.current;
    timeTakenRef.current[currentIdx] = elapsed;
  }, [currentIdx]);

  const goToNext = useCallback((autoAdvance = false) => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else if (!autoAdvance) {
      setShowConfirmModal(true);
    }
  }, [currentIdx, questions.length]);

  const handleSelectOption = (optIdx) => {
    recordTimeForCurrent();
    setAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
  };

  const handleClearAnswer = () => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[currentIdx];
      return next;
    });
  };

  const handleNavigate = (idx) => {
    recordTimeForCurrent();
    setCurrentIdx(idx);
  };

  const handlePrev = () => {
    recordTimeForCurrent();
    setCurrentIdx(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    recordTimeForCurrent();
    goToNext();
  };

  const toggleReview = () => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      next.has(currentIdx) ? next.delete(currentIdx) : next.add(currentIdx);
      return next;
    });
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    recordTimeForCurrent();

    try {
      // If it's a drill, we might not have a real testId in the database
      // For now, let's just show results locally if it's a drill, 
      // or we can implement a 'practice' submission.
      if (location.state?.isDrill) {
        toast.success("Drill completed! Review your performance.");
        // We can still try to submit with a 'null' or 'drill' testId if backend supports it
        // but for now let's just go back to practice or dashboard
        navigate('/practice');
        return;
      }

      // Build answer array — include all questions, skipped ones get selectedIndex: null
      const formattedAnswers = questions.map((q, idx) => ({
        questionId: q.id,
        selectedIndex: answers[idx] !== undefined ? answers[idx] : null,
        timeTaken: Math.round((timeTakenRef.current[idx] || 0) / 1000) // seconds
      })).filter(a => a.selectedIndex !== null); // only answered ones for scoring

      const res = await axios.post('/api/submissions', {
        testId: id,
        answers: formattedAnswers
      });

      toast.success(`Test Submitted! You earned ${res.data.coinsEarned} coins 🎉`);
      navigate(`/result/${res.data.id}`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
      setShowConfirmModal(false);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold">Loading Questions...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-bold">No questions found for this test.</h2>
        <button onClick={() => navigate('/tests')} className="btn btn-primary">Back to Tests</button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const reviewCount = markedForReview.size;
  const selectedOption = answers[currentIdx];
  const hasSelected = selectedOption !== undefined;

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[var(--text-primary)]">

      {/* Top Bar */}
      <header className="h-16 bg-primary text-white flex items-center justify-between px-4 md:px-6 shrink-0 shadow-lg relative z-20">
        <div className="font-heading font-bold lg:text-lg truncate w-1/3 text-sm">
          {test?.title || 'Mock Test'}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className={`flex items-center gap-2 font-bold text-base md:text-xl px-3 py-1 rounded-lg ${timeLeft < 300 ? 'bg-red-500 animate-pulse' : 'bg-primary-light border border-[#1E3A5F]'}`}>
            <Clock size={18} />
            {formatTime(timeLeft)}
          </div>
          <div className={`flex items-center gap-1 font-bold text-sm md:text-lg px-2 py-1 rounded-lg border ${qTimeLeft < 8 ? 'text-red-400 border-red-500 animate-bounce' : 'text-orange-400 border-orange-400'}`}>
            {qTimeLeft}s
          </div>
        </div>

        <div className="flex items-center gap-2 w-1/3 justify-end">
          <span className="text-xs text-gray-300 hidden md:block">
            {currentIdx + 1} / {questions.length}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* Left Panel - Question */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col pb-28 lg:pb-8">

          {/* Question Header */}
          <div className="flex justify-between items-center mb-5">
            <span className="text-sm font-bold bg-[var(--bg-card)] px-3 py-1 rounded-lg border border-[var(--border)] shadow-sm">
              Q{currentIdx + 1} of {questions.length}
            </span>
            <span className="text-xs font-semibold text-accent-purple bg-accent-purple bg-opacity-10 px-3 py-1 rounded-full border border-accent-purple border-opacity-20">
              {currentQ.category}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-lg md:text-xl font-medium mb-8 leading-relaxed max-w-3xl">
            {currentQ.text}
          </h2>

          {/* Options */}
          <div className="space-y-3 max-w-2xl">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-150 flex items-center gap-4 text-base
                    ${isSelected
                      ? 'border-secondary bg-[rgba(255,107,0,0.08)] shadow-md ring-2 ring-secondary/20'
                      : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-primary/40 hover:bg-[var(--bg-light)]'
                    }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all
                    ${isSelected
                      ? 'bg-secondary text-white shadow-md'
                      : 'bg-[var(--bg-light)] text-[var(--text-secondary)] border border-[var(--border)]'
                    }`}>
                    {isSelected ? <CheckCircle size={16} /> : String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`flex-1 ${isSelected ? 'font-semibold text-[var(--text-primary)]' : ''}`}>{opt}</span>
                  {isSelected && (
                    <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded shrink-0">Selected</span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Clear Selection */}
          {hasSelected && (
            <button
              onClick={handleClearAnswer}
              className="mt-4 text-sm text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
            >
              ✕ Clear Selection
            </button>
          )}

          {/* Desktop Navigation */}
          <div className="mt-auto hidden lg:flex items-center justify-between pt-8 px-1">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="btn btn-outline flex items-center gap-2 disabled:opacity-40"
            >
              <ChevronLeft size={18} /> Previous
            </button>

            <button
              onClick={toggleReview}
              className={`btn flex items-center gap-2 border ${markedForReview.has(currentIdx)
                ? 'bg-orange-100 text-orange-600 border-orange-300 dark:bg-[rgba(255,165,0,0.2)] dark:text-orange-400 dark:border-orange-600'
                : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-light)]'}`}
            >
              <Bookmark size={18} className={markedForReview.has(currentIdx) ? 'fill-current' : ''} />
              {markedForReview.has(currentIdx) ? 'Marked' : 'Mark for Review'}
            </button>

            <button
              onClick={handleNext}
              className="btn bg-[var(--text-primary)] text-[var(--bg-card)] hover:opacity-90 flex items-center gap-2"
            >
              {currentIdx === questions.length - 1 ? 'Finish' : 'Save & Next'} <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Right Panel - Navigator */}
        <div className="hidden lg:flex w-[380px] bg-[var(--bg-card)] border-l border-[var(--border)] flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.03)]">

          {/* Legend */}
          <div className="p-5 border-b border-[var(--border)]">
            <h3 className="font-heading font-bold text-base mb-4">Question Palette</h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-secondary"></div> Answered ({answeredCount})
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-orange-400"></div> Marked ({reviewCount})
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-[var(--border)] border border-gray-400"></div> Not Attempted
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-5 flex content-start flex-wrap gap-2">
            {questions.map((_, idx) => {
              const isAns = answers[idx] !== undefined;
              const isMark = markedForReview.has(idx);
              const isActive = currentIdx === idx;

              let cls = 'bg-[var(--bg-light)] border-[var(--border)] text-[var(--text-primary)]';
              if (isAns) cls = 'bg-secondary border-secondary text-white';
              else if (isMark) cls = 'bg-orange-400 border-orange-400 text-white';
              if (isActive) cls += ' ring-2 ring-primary ring-offset-2 dark:ring-offset-[var(--bg-card)]';

              return (
                <button
                  key={idx}
                  onClick={() => handleNavigate(idx)}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-bold text-xs transition-all hover:-translate-y-0.5 shadow-sm ${cls}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="p-5 border-t border-[var(--border)] bg-[var(--bg-light)]">
            <div className="mb-3 text-xs text-[var(--text-secondary)] text-center">
              {answeredCount} answered · {questions.length - answeredCount} remaining
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full btn btn-primary py-3 text-base font-bold shadow-md hover:shadow-xl"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[var(--bg-card)] border-t border-[var(--border)] p-3 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.07)] z-20 gap-2">
        <button onClick={handlePrev} disabled={currentIdx === 0} className="p-2.5 border rounded-full text-[var(--text-primary)] disabled:opacity-40"><ChevronLeft size={20} /></button>
        <button onClick={toggleReview} className="px-4 py-2 border bg-orange-50 text-orange-600 border-orange-200 rounded-full text-xs font-bold flex items-center gap-1">
          <Bookmark size={13} className={markedForReview.has(currentIdx) ? 'fill-current' : ''} />
          {markedForReview.has(currentIdx) ? 'Marked' : 'Mark'}
        </button>
        <button onClick={() => setShowConfirmModal(true)} className="px-4 py-2 bg-red-500 text-white rounded-full text-xs font-bold">Submit</button>
        <button onClick={handleNext} className="p-2.5 bg-primary text-white rounded-full"><ChevronRight size={20} /></button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card bg-[var(--bg-card)] max-w-md w-full p-8"
          >
            <div className="flex justify-center text-secondary mb-4">
              <AlertTriangle size={48} />
            </div>
            <h2 className="text-2xl font-bold font-heading text-center mb-2">Ready to Submit?</h2>
            <p className="text-center text-[var(--text-secondary)] mb-6">
              You have <strong>{questions.length - answeredCount}</strong> unanswered questions. This cannot be undone.
            </p>

            <div className="bg-[var(--bg-light)] rounded-xl p-4 mb-8 grid grid-cols-3 gap-2 text-center border border-[var(--border)]">
              <div>
                <span className="block font-bold text-accent-green text-2xl">{answeredCount}</span>
                <span className="text-xs text-[var(--text-secondary)]">Answered</span>
              </div>
              <div>
                <span className="block font-bold text-orange-400 text-2xl">{reviewCount}</span>
                <span className="text-xs text-[var(--text-secondary)]">Marked</span>
              </div>
              <div>
                <span className="block font-bold text-gray-400 text-2xl">{questions.length - answeredCount}</span>
                <span className="text-xs text-[var(--text-secondary)]">Skipped</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                className="flex-1 btn btn-outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
              >
                Go Back
              </button>
              <button
                className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Submitting...</>
                ) : (
                  'Submit Test'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TestInterface;
