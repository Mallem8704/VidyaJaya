import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  TrendingUp, 
  Calendar,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Wallet = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await axios.get('/api/wallet');
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-xs">Syncing Ledger...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      
      {/* 💳 BALANCE CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-orange-500/30"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
          <WalletIcon size={180} />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 opacity-80">
            <Sparkles size={20} />
            <span className="font-black uppercase tracking-[0.2em] text-xs">Total Balance</span>
          </div>
          
          <div className="flex items-end gap-3">
            <h1 className="text-7xl font-black font-heading tabular-nums">{data.balance}</h1>
            <span className="text-2xl font-bold mb-3 opacity-80">Coins</span>
          </div>

          <div className="flex gap-4 pt-4">
            <button className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-full text-xs font-black uppercase transition-all backdrop-blur-sm">
              Redeem Rewards
            </button>
            <button className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full text-xs font-black uppercase transition-all backdrop-blur-sm">
              How it works
            </button>
          </div>
        </div>
      </motion.div>

      {/* 📜 TRANSACTION HISTORY */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-black font-heading flex items-center gap-3">
            <History className="text-orange-500" /> Transaction History
          </h2>
          <span className="text-xs font-black text-[var(--text-secondary)] uppercase">Showing last 20</span>
        </div>

        <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-xl">
          <AnimatePresence>
            {data.recent_transactions.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {data.recent_transactions.map((tx, i) => (
                  <motion.div 
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 flex items-center justify-between hover:bg-[var(--bg-light)] transition-colors"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        tx.type === 'reward' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {tx.type === 'reward' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                      </div>
                      
                      <div>
                        <div className="font-black text-lg">{tx.description}</div>
                        <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-secondary)] uppercase">
                          <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(tx.created_at).toLocaleDateString()}</span>
                          {tx.contest_date && <span className="bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full">{tx.contest_date}</span>}
                        </div>
                      </div>
                    </div>

                    <div className={`text-2xl font-black ${
                      tx.type === 'reward' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {tx.type === 'reward' ? '+' : '-'}{tx.amount}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center space-y-4 opacity-50">
                <TrendingUp size={64} className="mx-auto" />
                <h3 className="text-xl font-black">YOUR JOURNEY BEGINS</h3>
                <p className="font-medium max-w-xs mx-auto">Complete daily tests and climb the leaderboard to start earning coins.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default Wallet;
