import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, History, CreditCard, Landmark, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Wallet = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [upiId, setUpiId] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/wallet/balance');
            setBalance(res.data.balance);
            setTransactions(res.data.transactions);
        } catch (err) {
            console.error('Wallet fetch error:', err);
            toast.error('Failed to load wallet data');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (withdrawAmount < 50) {
            toast.error('Minimum withdrawal is ₹50');
            return;
        }
        if (!upiId.includes('@')) {
            toast.error('Please enter a valid UPI ID');
            return;
        }

        setIsWithdrawing(true);
        try {
            const res = await axios.post('/api/rewards/withdraw', {
                amount: parseInt(withdrawAmount),
                upiId
            });
            toast.success(res.data.message);
            setWithdrawAmount('');
            fetchWalletData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Withdrawal failed');
        } finally {
            setIsWithdrawing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-[var(--text-secondary)] font-medium">Securing your wallet...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Wallet Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card bg-gradient-to-br from-primary to-primary-light p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[240px]">
                    <div className="relative z-10">
                        <p className="text-blue-100 text-sm font-medium mb-1 opacity-80 uppercase tracking-widest">Total Balance</p>
                        <h2 className="text-5xl font-bold mb-6 flex items-baseline gap-2">
                            ₹{balance.toLocaleString()}
                            <span className="text-lg font-normal opacity-60">INR</span>
                        </h2>
                    </div>
                    
                    <div className="flex gap-4 relative z-10">
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                            <Sparkles className="text-accent-gold" size={18} />
                            <span className="text-sm font-bold">{Math.floor(balance * 10)} Coins</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-sm font-bold">Withdrawals Active</span>
                        </div>
                    </div>

                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
                        <WalletIcon size={180} />
                    </div>
                </div>

                <div className="card p-8 border border-[var(--border)] flex flex-col justify-center">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Landmark size={20} className="text-primary" /> Withdraw to Bank
                    </h3>
                    <form onSubmit={handleWithdraw} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Amount (Min ₹50)</label>
                            <input 
                                type="number" 
                                placeholder="e.g. 100"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                className="w-full bg-[var(--bg-light)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">UPI ID</label>
                            <input 
                                type="text" 
                                placeholder="name@okaxis"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="w-full bg-[var(--bg-light)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>
                        <button 
                            disabled={isWithdrawing}
                            className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
                        >
                            {isWithdrawing ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                            {isWithdrawing ? 'Processing...' : 'Withdraw Now'}
                        </button>
                    </form>
                    <p className="text-[10px] text-center text-[var(--text-secondary)] mt-4">
                        Payments processed within 24-48 hours.
                    </p>
                </div>
            </div>

            {/* Transaction History */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <History size={24} className="text-primary" /> Transaction History
                    </h3>
                    <button className="text-sm font-bold text-primary hover:underline">Download Statement</button>
                </div>

                <div className="space-y-3">
                    {transactions.length === 0 ? (
                        <div className="card p-12 text-center border-2 border-dashed border-[var(--border)]">
                            <AlertCircle size={40} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-[var(--text-secondary)]">No transactions found. Start practicing to earn rewards!</p>
                        </div>
                    ) : (
                        transactions.map((t, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={t.id} 
                                className="card p-5 border border-[var(--border)] flex items-center justify-between group hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.amount > 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                                        {t.amount > 0 ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[var(--text-primary)]">{t.description}</p>
                                        <p className="text-xs text-[var(--text-secondary)]">{new Date(t.created_at).toLocaleDateString()} • {new Date(t.created_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-bold ${t.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount)}
                                    </p>
                                    <span className="text-[10px] font-bold uppercase text-gray-400">Successful</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wallet;
