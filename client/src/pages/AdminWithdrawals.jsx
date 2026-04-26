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
    History,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminWithdrawals = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, paid: 0 });
    const [searchTerm, setSearchTerm] = useState('');

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
        const confirmMsg = status === 'paid' 
            ? 'Are you sure you want to mark this as PAID? This will finalize the transaction.' 
            : `Are you sure you want to mark this as ${status}?`;
            
        if (!window.confirm(confirmMsg)) return;

        const notes = prompt(`Enter notes for this ${status} action (optional):`);
        try {
            await axios.post(`/api/admin/withdrawals/${id}/update-status`, { 
                status,
                notes 
            });
            toast.success(`Request marked as ${status}`);
            fetchWithdrawals();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const filteredWithdrawals = withdrawals.filter(w => 
        w.upi_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
                        <IndianRupee className="text-primary" size={32} /> Withdrawal Management
                    </h1>
                    <p className="text-gray-500 mt-1">Review, approve, and finalize user prize payouts.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Pending', val: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                        { label: 'Approved', val: stats.approved, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Paid', val: stats.paid, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Rejected', val: stats.rejected, color: 'text-red-600', bg: 'bg-red-50' }
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} px-4 py-2 rounded-xl border border-black/5 text-center min-w-[100px]`}>
                            <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-[10px] uppercase font-bold opacity-60">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="flex bg-[var(--bg-light)] p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                    {['pending', 'approved', 'paid', 'rejected'].map((s) => (
                        <button 
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap ${filter === s ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by Name or UPI..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-light)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="px-6 py-20 text-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Queue...</p>
                    </div>
                ) : filteredWithdrawals.length === 0 ? (
                    <div className="card p-20 text-center border-2 border-dashed border-[var(--border)] bg-gray-50/50">
                        <History size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-medium">No {filter} requests found.</p>
                    </div>
                ) : (
                    filteredWithdrawals.map((req, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={req.id} 
                            className="card p-6 border border-[var(--border)] hover:shadow-lg transition-all group relative overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                                        <User className="text-primary/60" size={28} />
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="font-bold text-lg leading-none mb-1">{req.profiles?.name || 'Unknown User'}</p>
                                            <p className="text-xs text-gray-500">{req.profiles?.email}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10">
                                                <CreditCard size={14} />
                                                <span>{req.upi_id}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                <Clock size={12} />
                                                <span>{new Date(req.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:items-end justify-between gap-4">
                                    <div className="md:text-right">
                                        <p className="text-3xl font-heading font-bold text-gray-900 dark:text-white">₹{req.amount}</p>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{req.amount * 10} Coins</p>
                                    </div>

                                    <div className="flex gap-2">
                                        {filter === 'pending' && (
                                            <>
                                                <button 
                                                    onClick={() => handleAction(req.id, 'rejected')}
                                                    className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2 text-xs font-bold"
                                                >
                                                    <XCircle size={16} /> Reject
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(req.id, 'approved')}
                                                    className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all flex items-center gap-2 text-xs font-bold shadow-lg shadow-primary/20"
                                                >
                                                    <CheckCircle size={16} /> Approve
                                                </button>
                                            </>
                                        )}
                                        {filter === 'approved' && (
                                            <button 
                                                onClick={() => handleAction(req.id, 'paid')}
                                                className="px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all flex items-center gap-2 text-xs font-bold shadow-lg shadow-green-200"
                                            >
                                                <CheckCircle2 size={16} /> Mark as Paid
                                            </button>
                                        )}
                                        {filter === 'paid' && (
                                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-100 font-bold text-xs">
                                                <CheckCircle2 size={16} /> Transaction Settled
                                            </div>
                                        )}
                                        {filter === 'rejected' && (
                                            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-100 font-bold text-xs">
                                                <AlertCircle size={16} /> Request Rejected
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {req.admin_notes && (
                                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-500 flex items-start gap-2">
                                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                    <span>Note: {req.admin_notes}</span>
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
