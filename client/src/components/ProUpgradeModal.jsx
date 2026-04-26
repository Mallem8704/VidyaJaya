import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Diamond, CheckCircle2, Zap, Trophy, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProUpgradeModal = ({ isOpen, onClose, feature }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Hero Header */}
          <div className="bg-gradient-to-br from-primary to-primary-dark p-8 text-center text-white relative">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
              <Zap className="absolute -top-4 -left-4" size={100} />
              <Diamond className="absolute -bottom-4 -right-4" size={100} />
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <Diamond className="text-secondary" size={32} />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-1">Unlock Full Potential</h2>
            <p className="text-blue-100 text-sm">Experience the premium edge in your preparation</p>
          </div>

          <div className="p-8">
            {feature && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                <Target className="text-amber-600 shrink-0 mt-1" size={18} />
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  {feature === 'ai' ? "You've reached your free AI Practice limit." : "This feature is reserved for Pro users."}
                </p>
              </div>
            )}

            <div className="space-y-4 mb-8">
              {[
                { icon: <Zap size={18} />, text: "Unlimited AI Practice Sets", sub: "Daily generation without caps" },
                { icon: <Target size={18} />, text: "Full Access to All Mock Tests", sub: "1000+ UPSC standard questions" },
                { icon: <Trophy size={18} />, text: "Pro Weekly & Monthly Rankings", sub: "Compete for premium rewards" },
                { icon: <CheckCircle2 size={18} />, text: "Detailed Performance Analytics", sub: "Identify your weak spots easily" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 text-primary">{item.icon}</div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{item.text}</h4>
                    <p className="text-xs text-[var(--text-secondary)]">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  onClose();
                  navigate('/pricing');
                }}
                className="w-full btn bg-secondary hover:bg-secondary-dark text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                Upgrade to Pro Now
                <Zap size={18} />
              </button>
              <button 
                onClick={onClose}
                className="w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProUpgradeModal;
