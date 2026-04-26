import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
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
    CheckCircle2,
    TrendingUp,
    Clock,
    ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const Wallet = () => {
    const { user } = useAuthStore();
    const [wallet, setWallet] = useState(null);
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
            setWallet(res.data.wallet);
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
        if (!user?.is_verified) {
            toast.error('Please verify your mobile number first');
            return;
        }
        if (!user?.kyc_verified) {
            toast.error('Identity Verification (KYC) required for withdrawals');
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
            {/* Wallet Header Card */}
            <div className="card bg-gradient-to-br from-[#0a2540] to-[#1e3a8a] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2 opacity-80 text-blue-200">
                            <WalletIcon size={16} />
                            <p className="text-xs font-bold uppercase tracking-widest">Available Balance</p>
                        </div>
                        <h2 className="text-6xl font-bold mb-6 flex items-baseline gap-3">
                            ₹{balance.toLocaleString()}
                            <span className="text-lg font-normal text-blue-300">INR</span>
                        </h2>
                        
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 flex items-center gap-2">
                                <Sparkles className="text-accent-gold" size={16} />
                                <span className="text-sm font-bold">{wallet?.total_earned || 0} Total Coins</span>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border ${user?.is_verified ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}>
                                <ShieldCheck size={16} />
                                <span className="text-xs font-bold uppercase">{user?.is_verified ? 'Verified' : 'Unverified'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] uppercase font-bold text-blue-300 mb-1">Total Earned</p>
                            <p className="text-2xl font-bold">₹{(wallet?.total_earned || 0) / 10}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] uppercase font-bold text-blue-300 mb-1">Withdrawn</p>
                            <p className="text-2xl font-bold">₹{(wallet?.withdrawn_amount || 0) / 10}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] uppercase font-bold text-blue-300 mb-1">Pending</p>
                            <p className="text-2xl font-bold text-yellow-400">₹{(wallet?.pending_withdrawal || 0) / 10}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] uppercase font-bold text-blue-300 mb-1">Multiplier</p>
                            <p className="text-2xl font-bold text-accent-gold">1.0x</p>
                        </div>
                    </div>
                </div>

                <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Withdrawal Form */}
                <div className="lg:col-span-1 card p-8 border border-[var(--border)] shadow-xl bg-white dark:bg-gray-900">
                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                        <Landmark size={24} className="text-primary" /> Withdraw Prize
                    </h3>
                    <form onSubmit={handleWithdraw} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Amount (Min ₹50)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                <input 
                                    type="number" 
                                    placeholder="0"
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
                                placeholder="name@upi"
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
                    
                    <div className="mt-8 space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <AlertCircle size={16} className="text-blue-500 mt-0.5" />
                            <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">
                                Funds are transferred within 24-48 hours. Ensure your UPI ID is correct.
                            </p>
                        </div>
                        {/* Verification Guards */}
                        {!user?.is_verified && (
                            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <Smartphone size={16} className="text-blue-500 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] text-blue-700 dark:text-blue-300 font-bold uppercase">Mobile Verification</p>
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400">Verify your mobile to earn rewards.</p>
                                    <Link to="/profile" className="text-[10px] font-bold text-blue-700 underline block">Verify Mobile</Link>
                                </div>
                            </div>
                        )}
                        {!user?.kyc_verified && (
                            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                <ShieldCheck size={16} className="text-amber-500 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase">KYC Required</p>
                                    <p className="text-[10px] text-amber-600 dark:text-amber-400">Identity verification needed to withdraw money.</p>
                                    <Link to="/kyc" className="text-[10px] font-bold text-amber-700 underline block">Complete KYC Now</Link>
                                </div>
                            </div>
                        )}
                        {user?.kyc_verified && (
                             <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                                <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] text-green-700 dark:text-green-300 font-bold uppercase">KYC Approved</p>
                                    <p className="text-[10px] text-green-600 dark:text-green-400">Withdrawals are active for your account.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            <History size={28} className="text-primary" /> Recent Transactions
                        </h3>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {transactions.length === 0 ? (
                            <div className="card p-12 text-center border-2 border-dashed border-[var(--border)] flex flex-col items-center">
                                <AlertCircle size={48} className="text-gray-200 mb-4" />
                                <p className="text-[var(--text-secondary)] font-medium">No activity yet.</p>
                            </div>
                        ) : (
                            transactions.map((t, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={t.id} 
                                    className="card p-4 border border-[var(--border)] flex items-center justify-between group hover:border-primary/40 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'credit' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                                            {t.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-[var(--text-primary)]">
                                                {t.source === 'reward' ? 'Leaderboard Reward' : 
                                                 t.source === 'withdrawal_request' ? 'Withdrawal Request' :
                                                 t.source === 'withdrawal_rejection' ? 'Withdrawal Refund' : t.source}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-[var(--text-secondary)]">{new Date(t.created_at).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-[var(--text-secondary)] opacity-40">•</span>
                                                <span className={`text-[10px] font-bold uppercase ${t.status === 'success' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                    {t.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${t.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                                            {t.type === 'credit' ? '+' : '-'}₹{t.amount / 10}
                                        </p>
                                        <p className="text-[9px] text-[var(--text-secondary)] font-medium">
                                            {t.amount} Coins
                                        </p>
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
