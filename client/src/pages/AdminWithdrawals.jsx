import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Clock, 
    CheckCircle, 
    XCircle, 
    User, 
    CreditCard, 
    Search,
    Loader2,
    IndianRupee,
    History
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminWithdrawals = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

    useEffect(() => {
        fetchWithdrawals();
    }, [filter]);

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/withdrawals?status=${filter}`);
            setWithdrawals(res.data.requests);
            setStats(res.data.stats);
        } catch (err) {
            toast.error('Failed to load withdrawal requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        const notes = prompt(`Enter notes for this ${status} action (optional):`);
        try {
            await axios.post(`/api/admin/withdrawals/${id}/${status}`, { notes });
            toast.success(`Request ${status} successfully`);
            fetchWithdrawals();
        } catch (err) {
            toast.error('Action failed');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
                        <IndianRupee className="text-secondary" size={32} /> Payout Queue
                    </h1>
                    <p className="text-gray-500 mt-1">Review, approve, and track manual UPI withdrawals.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-xl border border-yellow-100 dark:border-yellow-900/50 text-center">
                        <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
                        <p className="text-[10px] uppercase font-bold text-yellow-500">Pending</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl border border-green-100 dark:border-green-900/50 text-center">
                        <p className="text-xl font-bold text-green-600">{stats.approved}</p>
                        <p className="text-[10px] uppercase font-bold text-green-500">Processed</p>
                    </div>
                </div>
            </div>

            {/* Filter & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border)]">
                <div className="flex bg-[var(--bg-light)] p-1 rounded-xl">
                    {['pending', 'approved', 'rejected'].map((s) => (
                        <button 
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${filter === s ? 'bg-secondary text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by User ID..." 
                        className="w-full bg-[var(--bg-light)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-secondary outline-none"
                    />
                </div>
            </div>

            {/* Request List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="px-6 py-20 text-center">
                        <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 font-medium uppercase tracking-widest font-heading">Fetching Queue...</p>
                    </div>
                ) : withdrawals.length === 0 ? (
                    <div className="card p-20 text-center border-2 border-dashed border-[var(--border)]">
                        <History size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium text-lg">No {filter} requests in the queue.</p>
                    </div>
                ) : (
                    withdrawals.map((req, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={req.id} 
                            className="card p-6 border border-[var(--border)] hover:border-secondary/40 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                        <User className="text-gray-500" size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-lg">{req.profiles?.name || 'Unknown User'}</p>
                                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-widest">{req.profiles?.plan}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[var(--bg-light)] px-2.5 py-1.5 rounded-lg border border-[var(--border)]">
                                                <CreditCard size={14} />
                                                <span>{req.upi_id}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                <Clock size={14} />
                                                <span>{new Date(req.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end justify-between gap-4">
                                    <div className="text-right">
                                        <p className="text-3xl font-heading font-bold text-secondary">₹{req.amount}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{req.amount * 10} Coins Deducted</p>
                                    </div>

                                    {filter === 'pending' && (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleAction(req.id, 'rejected')}
                                                className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                            <button 
                                                onClick={() => handleAction(req.id, 'approved')}
                                                className="px-4 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all flex items-center gap-1.5 text-xs font-bold shadow-lg shadow-green-200"
                                            >
                                                <CheckCircle size={16} /> Mark as Paid
                                            </button>
                                        </div>
                                    )}

                                    {filter !== 'pending' && (
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                            filter === 'approved' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                                        }`}>
                                            {filter}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {req.admin_notes && (
                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 text-xs italic text-gray-500">
                                    Admin Audit Note: {req.admin_notes}
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminWithdrawals;
