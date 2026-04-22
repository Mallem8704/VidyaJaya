import React, { useState, useEffect } from 'react';
import { UploadCloud, FileType, CheckCircle, Smartphone, Camera, Loader, Send, History } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const Doubts = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [solution, setSolution] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/doubts/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching doubts history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSolveDoubt = async (e) => {
    if (e) e.preventDefault();
    if (!questionText.trim()) return toast.error("Please enter a question");

    setIsUploading(true);
    setSolution(null);
    
    try {
      const res = await axios.post('/api/doubts/solve', { 
        questionText: questionText,
        type: 'text'
      });
      setSolution(res.data);
      toast.success("AI solved your doubt!");
      setQuestionText('');
      fetchHistory(); // Refresh history
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to solve doubt";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10 space-y-8">
      
      <div className="text-center max-w-2xl mx-auto mb-10">
         <h2 className="text-3xl font-heading font-bold mb-4">Snap or Type. Get Instant Solutions.</h2>
         <p className="text-[var(--text-secondary)]">Our GPT-4 powered AI scans your questions and gives you a step-by-step verified breakdown. Costs 10 💰 per doubt.</p>
      </div>

      {!solution && (
        <div className="space-y-6">
          <div className="card p-6 border-2 border-primary bg-[var(--bg-card)]">
            <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <Send size={18} className="text-secondary" /> Type your doubt
            </h3>
            <form onSubmit={handleSolveDoubt} className="space-y-4">
              <textarea 
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Example: What is the difference between Monetary Policy and Fiscal Policy?"
                className="w-full h-32 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-light)] outline-none focus:border-secondary transition-colors resize-none"
              />
              <button 
                type="submit" 
                disabled={isUploading || !questionText.trim()}
                className="btn btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {isUploading ? <Loader className="animate-spin" /> : <Send size={18} />}
                {isUploading ? "AI is thinking..." : "Solve using AI (10 💰)"}
              </button>
            </form>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[var(--bg-light)] px-4 text-[var(--text-secondary)] font-bold">OR SCAN IMAGE</span></div>
          </div>

          <div className="card p-8 md:p-12 border-2 border-dashed border-secondary bg-[rgba(255,107,0,0.02)] flex flex-col items-center justify-center text-center">
              {isUploading ? (
                <div className="flex flex-col items-center space-y-6">
                   <div className="relative">
                      <div className="w-24 h-24 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-3xl">🤖</div>
                   </div>
                   <h3 className="text-xl font-bold">Processing...</h3>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-secondary bg-opacity-20 rounded-full flex items-center justify-center text-secondary mb-4">
                     <Camera size={32} />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Upload doubt image</h3>
                  <p className="text-xs text-[var(--text-secondary)] mb-6">Coming Soon: Snap & Solve</p>
                  <button className="btn btn-outline border-secondary text-secondary flex items-center gap-2 opacity-50 cursor-not-allowed">
                    <CloudUploadIcon /> Browse Files
                  </button>
                </>
              )}
          </div>
        </div>
      )}

      {solution && (
         <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
            <button onClick={() => setSolution(null)} className="btn btn-outline text-sm">Ask Another Question</button>
            
            <div className="card border-2 border-accent-purple overflow-hidden shadow-xl">
               <div className="bg-accent-purple bg-opacity-10 p-6 border-b border-accent-purple border-opacity-20 flex gap-4">
                  <div className="text-3xl">📄</div>
                  <div>
                    <h4 className="text-xs font-bold text-accent-purple uppercase tracking-wider mb-2">Question</h4>
                    <p className="font-heading font-medium text-lg leading-relaxed">{solution.questionText}</p>
                  </div>
               </div>

               <div className="p-6 md:p-10 space-y-8 bg-[var(--bg-card)]">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Final Answer</h4>
                    <div className="inline-block px-6 py-3 bg-accent-green bg-opacity-10 text-accent-green font-bold text-2xl rounded-xl border border-accent-green border-opacity-50">
                       {solution.answer}
                    </div>
                  </div>

                  <div>
                     <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Step-by-Step Breakdown</h4>
                     <div className="bg-[var(--bg-light)] p-6 rounded-xl border border-[var(--border)] whitespace-pre-line leading-relaxed text-[15px]">
                        {solution.explanation}
                     </div>
                  </div>

                  {solution.relatedConcepts && (
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Related Concepts</h4>
                      <div className="flex gap-2 flex-wrap">
                          {solution.relatedConcepts.map(c => (
                            <span key={c} className="px-4 py-2 bg-[var(--bg-light)] border border-[var(--border)] rounded-full text-sm font-medium">{c}</span>
                          ))}
                      </div>
                    </div>
                  )}
               </div>
            </div>
         </motion.div>
      )}

      {/* History */}
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-xl flex items-center gap-2">
          <History size={20} className="text-secondary" /> Recent Doubts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.length > 0 ? history.map((h) => {
            const response = JSON.parse(h.ai_response || '{}');
            return (
              <div key={h.id} className="card p-4 hover:border-secondary transition-colors cursor-pointer group" onClick={() => {
                setSolution({
                  questionText: h.question_text,
                  answer: response.answer,
                  explanation: response.explanation,
                  relatedConcepts: response.relatedConcepts
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold bg-[var(--bg-light)] px-2 py-0.5 rounded text-[var(--text-secondary)] uppercase">{h.topic}</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">{new Date(h.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-secondary transition-colors">{h.question_text}</p>
                <div className="text-xs text-accent-green font-bold flex items-center gap-1">
                  <CheckCircle size={12} /> Solved
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-10 text-center card bg-gray-50 dark:bg-[#151c27]">
              <p className="text-[var(--text-secondary)] font-medium">No doubt history yet.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

const CloudUploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m16 16-4-4-4 4"></path></svg>;

export default Doubts;
