import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Bookmark, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import axios from 'axios';


const TestInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { qIndex: optionIndex }
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0); 
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchTestData = async () => {
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
  }, [id]);

  // Timer logic
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

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIdx) => {
    setAnswers({ ...answers, [currentIdx]: optIdx });
  };

  const toggleReview = () => {
    const newMarked = new Set(markedForReview);
    if (newMarked.has(currentIdx)) {
      newMarked.delete(currentIdx);
    } else {
      newMarked.add(currentIdx);
    }
    setMarkedForReview(newMarked);
  };

  const handleSubmit = async () => {
    try {
      const formattedAnswers = Object.entries(answers).map(([qIdx, optIdx]) => ({
        questionId: questions[qIdx].id,
        selectedIndex: optIdx,
        timeTaken: 60 // Mock time taken for now
      }));

      const res = await axios.post('/api/submissions', {
        testId: id,
        answers: formattedAnswers
      });

      toast.success('Test Submitted Successfully!');
      navigate(`/result/${res.data.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong submitting your test. Please try again.');
      setShowConfirmModal(false);
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

  // Stats calculation
  const answeredCount = Object.keys(answers).length;
  const reviewCount = markedForReview.size;
  const unvisitedCount = questions.length - answeredCount - reviewCount; 

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[var(--text-primary)]">
      
      {/* Top Bar */}
      <header className="h-16 bg-primary text-white flex items-center justify-between px-6 shrink-0 shadow-lg relative z-20">
        <div className="font-heading font-bold lg:text-lg truncate w-1/3">
          {test?.title || 'Mock Test'}
        </div>
        
        <div className={`flex items-center gap-2 font-bold text-xl px-4 py-1 rounded-lg ${timeLeft < 300 ? 'bg-red-500 animate-pulse' : 'bg-primary-light border border-[#1E3A5F]'}`}>
          <Clock size={20} />
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex items-center gap-4 w-1/3 justify-end">
          <span className="text-sm text-gray-300 hidden md:block">Question {currentIdx + 1} of {questions.length}</span>
          <button 
            className="btn bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] border border-[rgba(255,255,255,0.2)] py-1.5 px-4 text-sm"
            onClick={() => {}}
          >
            Pause
          </button>
        </div>
      </header>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Panel - Question Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col relative pb-32 lg:pb-10">
          <div className="flex justify-between mb-6">
            <span className="text-sm font-bold bg-[var(--bg-card)] px-3 py-1 rounded border border-[var(--border)] shadow-sm">
              Q{currentIdx + 1}.
            </span>
            <span className="text-xs font-semibold text-accent-purple bg-accent-purple bg-opacity-10 px-3 py-1 rounded-full border border-accent-purple border-opacity-20">
               {currentQ.category}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-medium mb-10 leading-relaxed max-w-4xl">
            {currentQ.text}
          </h2>

          <div className="space-y-4 max-w-3xl">
            {currentQ.options.map((opt, idx) => {
              const isSelected = answers[currentIdx] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-5 rounded-custom border-2 transition-all duration-200 flex items-center gap-4 text-lg
                    ${isSelected 
                      ? 'border-secondary bg-[rgba(255,107,0,0.05)] shadow-md' 
                      : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-gray-400 dark:hover:border-gray-600'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors
                    ${isSelected ? 'bg-secondary text-white' : 'bg-[var(--bg-light)] text-[var(--text-secondary)] border border-[var(--border)]'}
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={isSelected ? 'font-medium' : ''}>{opt}</span>
                </button>
              );
            })}
          </div>
          
          <div className="mt-auto hidden lg:flex items-center justify-between pt-10 px-2 lg:sticky bottom-0 bg-[var(--bg-light)] lg:bg-transparent">
             <button 
               onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
               disabled={currentIdx === 0}
               className="btn btn-outline flex items-center gap-2"
             >
               <ChevronLeft size={18} /> Previous
             </button>
             
             <button 
               onClick={toggleReview}
               className={`btn flex items-center gap-2 border ${markedForReview.has(currentIdx) ? 'bg-orange-100 text-orange-600 border-orange-300 dark:bg-[rgba(255,165,0,0.2)] dark:text-orange-400 dark:border-orange-600' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-light)]'}`}
             >
               <Bookmark size={18} className={markedForReview.has(currentIdx) ? 'fill-current' : ''} /> 
               {markedForReview.has(currentIdx) ? 'Marked for Review' : 'Mark for Review'}
             </button>

             <button 
               onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
               disabled={currentIdx === questions.length - 1}
               className="btn bg-[var(--text-primary)] text-[var(--bg-card)] hover:opacity-90 flex items-center gap-2"
             >
               Next <ChevronRight size={18} />
             </button>
          </div>
        </div>

        {/* Right Panel - Navigator */}
        <div className="w-full lg:w-[400px] bg-[var(--bg-card)] border-l border-[var(--border)] flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="p-6 border-b border-[var(--border)]">
            <h3 className="font-heading font-bold text-lg mb-4">Questions Palette</h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-accent-green"></div> Answered ({answeredCount})
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-orange-400"></div> Marked ({reviewCount})
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-[var(--border)] border border-gray-400"></div> Not Visited
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex content-start flex-wrap gap-2.5">
            {questions.map((_, idx) => {
              const isAns = answers[idx] !== undefined;
              const isMark = markedForReview.has(idx);
              const isActive = currentIdx === idx;
              
              let bgClass = "bg-[var(--bg-light)] border-[var(--border)]";
              let textClass = "text-[var(--text-primary)]";
              
              if (isAns) {
                bgClass = "bg-accent-green border-accent-green";
                textClass = "text-white";
              } else if (isMark) {
                bgClass = "bg-orange-400 border-orange-400";
                textClass = "text-white";
              }
              
              if (isActive) {
                bgClass += " ring-2 ring-primary ring-offset-2 dark:ring-offset-[var(--bg-card)]";
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-sm transition-all hover:-translate-y-0.5 shadow-sm ${bgClass} ${textClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-light)] mt-auto">
            <button 
              onClick={() => setShowConfirmModal(true)}
              className="w-full btn btn-primary py-3 text-lg font-bold shadow-md hover:shadow-xl"
            >
              Submit Test
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[var(--bg-card)] border-t border-[var(--border)] p-3 flex justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
         <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} className="p-2 border rounded-full text-[var(--text-primary)]"><ChevronLeft /></button>
         <button onClick={toggleReview} className="px-6 border bg-orange-50 text-orange-600 border-orange-200 rounded-full text-sm font-semibold flex items-center gap-1">
           <Bookmark size={14} className={markedForReview.has(currentIdx) ? 'fill-current' : ''} /> {markedForReview.has(currentIdx) ? 'Marked' : 'Mark'}
         </button>
         <button onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))} className="p-2 bg-primary text-white rounded-full"><ChevronRight /></button>
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
              You have {questions.length - answeredCount} unanswered questions. Check your palette before submitting.
            </p>
            
            <div className="bg-[var(--bg-light)] rounded-lg p-4 mb-8 flex justify-around text-center border border-[var(--border)]">
              <div><span className="block font-bold text-accent-green text-xl">{answeredCount}</span><span className="text-xs">Answered</span></div>
              <div><span className="block font-bold text-orange-400 text-xl">{reviewCount}</span><span className="text-xs">Marked</span></div>
              <div><span className="block font-bold text-gray-500 text-xl">{questions.length - answeredCount}</span><span className="text-xs">Pending</span></div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 btn btn-outline" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button className="flex-1 btn btn-primary" onClick={handleSubmit}>Submit Anyway</button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default TestInterface;
