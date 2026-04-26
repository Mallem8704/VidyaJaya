import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet as WalletIcon, 
    ArrowUpRight, 
    ArrowDownLeft, 
    History, 
    CreditCard, 
    Landmark, 
    Loader2, 
    Sparkles, 
    AlertCircle, 
    Users, 
    Copy, 
    CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const Wallet = () => {
    const { user } = useAuthStore();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [upiId, setUpiId] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [copied, setCopied] = useState(false);

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
        if (withdrawAmount < 100) {
            toast.error('Minimum withdrawal is ₹100');
            return;
        }
        if (!upiId.includes('@')) {
            toast.error('Please enter a valid UPI ID');
            return;
        }

        setIsWithdrawing(true);
        try {
            const res = await axios.post('/api/wallet/withdraw', {
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

    const copyReferralCode = () => {
        if (!user?.referral_code) return;
        navigator.clipboard.writeText(user.referral_code);
        setCopied(true);
        toast.success('Referral code copied!');
        setTimeout(() => setCopied(false), 2000);
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
            {/* Top Section: Balance & Referrals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Wallet Balance Card */}
                <div className="lg:col-span-2 card bg-gradient-to-br from-primary via-primary-light to-secondary p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[260px] shadow-2xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <WalletIcon size={16} />
                            <p className="text-xs font-bold uppercase tracking-widest">Available Balance</p>
                        </div>
                        <h2 className="text-6xl font-bold mb-6 flex items-baseline gap-3">
                            ₹{balance.toLocaleString()}
                            <span className="text-lg font-normal opacity-60">INR</span>
                        </h2>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 relative z-10">
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                            <Sparkles className="text-accent-gold" size={18} />
                            <span className="text-sm font-bold">{Math.floor(balance * 10)} Coins</span>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border ${user?.is_pro ? 'bg-accent-gold/20 border-accent-gold/30 text-accent-gold' : 'bg-white/10 border-white/10 text-white'}`}>
                            {user?.is_pro ? (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
                                <span className="text-sm font-bold uppercase tracking-tighter">PRO Earning Active</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 opacity-80">
                                <AlertCircle size={14} />
                                <span className="text-sm font-bold uppercase tracking-tighter">Earnings Restricted</span>
                              </div>
                            )}
                        </div>
                    </div>

                    {!user?.is_pro && (
                      <Link to="/pricing" className="mt-6 inline-flex items-center gap-2 bg-accent-gold text-[#0a2540] px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform relative z-20 shadow-xl shadow-black/20">
                        <Sparkles size={16} />
                        Upgrade to PRO to Enable Earnings
                      </Link>
                    )}

                    <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 scale-150">
                        <WalletIcon size={180} />
                    </div>
                </div>

                {/* Refer & Earn Card */}
                <div className="card p-8 border-2 border-dashed border-secondary/30 bg-secondary/5 flex flex-col justify-between relative overflow-hidden group">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                                <Users size={20} />
                            </div>
                            <h3 className="font-bold text-lg">Refer & Earn</h3>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">Invite friends and earn <span className="font-bold text-secondary">₹10</span> per successful referral!</p>
                        
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Referral Code</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white dark:bg-gray-800 border border-[var(--border)] rounded-xl px-4 py-3 font-mono font-bold text-lg tracking-widest text-secondary text-center">
                                    {user?.referral_code || '---'}
                                </div>
                                <button 
                                    onClick={copyReferralCode}
                                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-secondary text-white hover:bg-secondary-dark transition-all shadow-lg shadow-secondary/20"
                                >
                                    {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                        <AlertCircle size={12} />
                        <span>Reward paid after their 1st test attempt.</span>
                    </div>
                </div>
            </div>

            {/* Middle Section: Withdraw & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 card p-8 border border-[var(--border)] shadow-xl">
                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                        <Landmark size={24} className="text-primary" /> Bank Payout
                    </h3>
                    <form onSubmit={handleWithdraw} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Amount (Min ₹100)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                <input 
                                    type="number" 
                                    placeholder="0.00"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full bg-[var(--bg-light)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-lg"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">UPI ID</label>
                            <input 
                                type="text" 
                                placeholder="example@upi"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="w-full bg-[var(--bg-light)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>
                        <button 
                            disabled={isWithdrawing}
                            className="btn btn-primary w-full py-4 flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                        >
                            {isWithdrawing ? <Loader2 size={20} className="animate-spin" /> : <CreditCard size={20} />}
                            <span className="font-bold">{isWithdrawing ? 'Processing...' : 'Withdraw Now'}</span>
                        </button>
                    </form>
                    <p className="text-[10px] text-center text-[var(--text-secondary)] mt-4 font-medium uppercase tracking-tighter">
                        Standard processing time: 24-48 Hours.
                    </p>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            <History size={28} className="text-primary" /> Activity Log
                        </h3>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/10">
                        {transactions.length === 0 ? (
                            <div className="card p-12 text-center border-2 border-dashed border-[var(--border)] flex flex-col items-center">
                                <AlertCircle size={48} className="text-gray-200 mb-4" />
                                <p className="text-[var(--text-secondary)] font-medium">No transactions found yet.</p>
                                <button className="text-primary text-sm font-bold mt-2 hover:underline">Start Practicing to Earn</button>
                            </div>
                        ) : (
                            transactions.map((t, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    key={t.id || idx} 
                                    className="card p-5 border border-[var(--border)] flex items-center justify-between group hover:border-primary/40 transition-all hover:bg-primary/[0.02]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${t.amount > 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                                            {t.amount > 0 ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--text-primary)] leading-tight">{t.description}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{t.type}</span>
                                                <span className="text-[10px] text-[var(--text-secondary)] opacity-60">{new Date(t.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-heading font-bold ${t.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount)}
                                        </p>
                                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                            t.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                            t.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                            'bg-blue-50 text-blue-500'
                                        }`}>
                                            {t.status || 'Complete'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;
