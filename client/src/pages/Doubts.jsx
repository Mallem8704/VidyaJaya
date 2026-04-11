import React, { useState } from 'react';
import { UploadCloud, FileType, CheckCircle, Smartphone, Camera, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Doubts = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [solution, setSolution] = useState(null);

  const handleMockUpload = () => {
    setIsUploading(true);
    setSolution(null);
    
    // Simulate AI parsing and solving the image
    setTimeout(() => {
      setIsUploading(false);
      setSolution({
        questionText: "If the simple interest on a sum of money for 2 years at 5% per annum is ₹50, what is the compound interest on the same sum at the same rate and for the same time?",
        answer: "₹51.25",
        explanation: "1. Simple Interest (SI) for 2 years = (P * R * T) / 100\n50 = (P * 5 * 2) / 100  => P = ₹500.\n\n2. Compound Interest (CI) for 2 years = P [(1 + R/100)^T - 1]\nCI = 500 * [ (1 + 5/100)^2 - 1 ]\nCI = 500 * [ (105/100)^2 - 1 ]\nCI = 500 * [ 1.1025 - 1 ] = 500 * 0.1025 = ₹51.25.",
        relatedConcepts: ["Simple Interest vs Compound Interest", "Percentage Calculations"]
      });
      toast.success("AI solved your doubt!");
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10 space-y-8">
      
      <div className="text-center max-w-2xl mx-auto mb-10">
         <h2 className="text-3xl font-heading font-bold mb-4">Snap a Photo. Get Instant Solutions.</h2>
         <p className="text-[var(--text-secondary)]">Our GPT-4 powered AI scans your handwritten notes or printed test papers and gives you a step-by-step verified breakdown.</p>
      </div>

      {!solution && (
        <div className="card p-8 md:p-12 border-2 border-dashed border-secondary bg-[rgba(255,107,0,0.02)] flex flex-col items-center justify-center text-center">
            {isUploading ? (
              <div className="flex flex-col items-center space-y-6">
                 <div className="relative">
                    <div className="w-24 h-24 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">🤖</div>
                 </div>
                 <h3 className="text-xl font-bold">Scanning Document...</h3>
                 <p className="text-sm text-[var(--text-secondary)]">Analyzing layout algorithms and extracting text models.</p>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-secondary bg-opacity-20 rounded-full flex items-center justify-center text-secondary mb-6 shadow-inner">
                   <Camera size={40} />
                </div>
                <h3 className="text-xl font-bold mb-2">Upload doubt image</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-8">PNG, JPG, or PDF (Max 5MB)</p>
                <div className="flex gap-4">
                  <button className="btn btn-outline border-secondary text-secondary flex items-center gap-2">
                    <CloudUploadIcon /> Browse Files
                  </button>
                  <button onClick={handleMockUpload} className="btn btn-primary flex items-center gap-2">
                     <Smartphone size={18} /> Use Phone Camera
                  </button>
                </div>
              </>
            )}
        </div>
      )}

      {solution && (
         <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
            <button onClick={() => setSolution(null)} className="btn btn-outline text-sm">Scan Another Question</button>
            
            <div className="card border-2 border-accent-purple overflow-hidden shadow-xl">
               <div className="bg-accent-purple bg-opacity-10 p-6 border-b border-accent-purple border-opacity-20 flex gap-4">
                  <div className="text-3xl">📄</div>
                  <div>
                    <h4 className="text-xs font-bold text-accent-purple uppercase tracking-wider mb-2">Detected Text</h4>
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

                  <div>
                     <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Related Concepts to Review</h4>
                     <div className="flex gap-2 flex-wrap">
                        {solution.relatedConcepts.map(c => (
                           <span key={c} className="px-4 py-2 bg-[var(--bg-light)] border border-[var(--border)] rounded-full text-sm font-medium">{c}</span>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </motion.div>
      )}

    </div>
  );
};

const CloudUploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m16 16-4-4-4 4"></path></svg>;

export default Doubts;
