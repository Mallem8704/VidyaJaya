import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Users, 
    Crown, 
    IndianRupee, 
    Clock, 
    ArrowUpRight, 
    ArrowDownRight, 
    Activity,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [flaggedUsers, setFlaggedUsers] = useState([]);
    const [kycPending, setKycPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingKyc, setProcessingKyc] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, safetyRes] = await Promise.all([
                axios.get('/api/admin/stats'),
                axios.get('/api/admin/safety-data')
            ]);
            setStats(statsRes.data);
            setFlaggedUsers(safetyRes.data.flaggedUsers);
            setKycPending(safetyRes.data.kycPending);
        } catch (err) {
            toast.error('Failed to load administrative data');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveKYC = async (userId) => {
        setProcessingKyc(userId);
        try {
            await axios.post(`/api/admin/kyc/${userId}/approve`);
            toast.success('KYC application approved!');
            fetchData();
        } catch (err) {
            toast.error('Failed to approve KYC');
        } finally {
            setProcessingKyc(null);
        }
    };

    const handleRejectKYC = async (userId) => {
        setProcessingKyc(userId);
        try {
            await axios.post(`/api/admin/kyc/${userId}/reject`);
            toast.success('KYC application rejected');
            fetchData();
        } catch (err) {
            toast.error('Failed to reject KYC');
        } finally {
            setProcessingKyc(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-secondary animate-spin mb-4" />
                <p className="text-secondary font-bold font-heading uppercase tracking-widest">Compiling Intelligence...</p>
            </div>
        );
    }

    const cards = [
        { name: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue', trend: '+12%' },
        { name: 'PRO Members', value: stats.proUsers, icon: Crown, color: 'amber', trend: '+5%' },
        { name: 'Total Payouts', value: `₹${stats.totalPaid}`, icon: IndianRupee, color: 'green', trend: '+₹1.2k' },
        { name: 'Pending Requests', value: stats.pendingPayouts, icon: Clock, color: 'rose', trend: '-2' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)]">Platform Overview</h1>
                <p className="text-gray-500">Real-time intelligence and growth metrics for VidyaJaya.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={card.name}
                        className="card p-6 border border-[var(--border)] shadow-xl relative overflow-hidden group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${card.color}-50 dark:bg-${card.color}-900/20 text-${card.color}-600 dark:text-${card.color}-400 shadow-sm`}>
                                <card.icon size={24} />
                            </div>
                            <span className={`flex items-center gap-1 text-xs font-bold ${card.trend.startsWith('+') ? 'text-green-500' : 'text-rose-500'}`}>
                                {card.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {card.trend}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{card.name}</h3>
                        <p className="text-3xl font-heading font-bold text-[var(--text-primary)] mt-1">{card.value}</p>
                        
                        <div className={`absolute bottom-0 left-0 w-full h-1 bg-${card.color}-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500`}></div>
                    </motion.div>
                ))}
            </div>

            {/* Safety & KYC Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Flagged Users List */}
                <div className="card p-8 border border-[var(--border)] shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Activity size={24} className="text-rose-500" /> Flagged Users (Anti-Cheat)
                    </h3>
                    {flaggedUsers.length === 0 ? (
                        <p className="text-gray-400 italic">No users flagged for suspicious activity.</p>
                    ) : (
                        <div className="space-y-4">
                            {flaggedUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/30">
                                    <div>
                                        <p className="font-bold text-sm">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 bg-white dark:bg-gray-800 text-xs font-bold rounded-lg border border-[var(--border)] hover:bg-gray-50">Unflag</button>
                                        <button className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-lg shadow-lg">Ban</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* KYC Pending List */}
                <div className="card p-8 border border-[var(--border)] shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <ShieldCheck size={24} className="text-accent-gold" /> Pending KYC Applications
                    </h3>
                    {kycPending.length === 0 ? (
                        <p className="text-gray-400 italic">No pending KYC reviews at the moment.</p>
                    ) : (
                        <div className="space-y-4">
                            {kycPending.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                    <div>
                                        <p className="font-bold text-sm">{user.name}</p>
                                        <p className="text-xs text-gray-500">ID: {user.kyc_provider_id || 'Pending'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleRejectKYC(user.id)}
                                            disabled={processingKyc === user.id}
                                            className="px-3 py-1 bg-white dark:bg-gray-800 text-xs font-bold rounded-lg border border-[var(--border)] disabled:opacity-50"
                                        >
                                            {processingKyc === user.id ? '...' : 'Reject'}
                                        </button>
                                        <button 
                                            onClick={() => handleApproveKYC(user.id)}
                                            disabled={processingKyc === user.id}
                                            className="px-3 py-1 bg-accent-gold text-yellow-900 text-xs font-bold rounded-lg shadow-lg disabled:opacity-50"
                                        >
                                            {processingKyc === user.id ? '...' : 'Approve'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Activity & Health Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                <div className="lg:col-span-2 card p-8 border border-[var(--border)] shadow-xl">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Activity size={24} className="text-secondary" /> System Health
                        </h3>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 font-bold text-[10px] rounded-full uppercase tracking-widest border border-green-100 dark:border-green-900/50">Backend: Stable</span>
                            <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 font-bold text-[10px] rounded-full uppercase tracking-widest border border-green-100 dark:border-green-900/50">Database: Optimal</span>
                        </div>
                    </div>
                    
                    <div className="h-64 flex items-center justify-center bg-[var(--bg-light)] rounded-3xl border-2 border-dashed border-[var(--border)]">
                        <div className="text-center space-y-4">
                            <ShieldCheck size={48} className="mx-auto text-gray-200" />
                            <p className="text-gray-400 font-medium italic">Active Monitoring Pulse: Normal</p>
                        </div>
                    </div>
                </div>

                <div className="card p-8 border border-[var(--border)] shadow-xl bg-gray-900 text-white">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <ShieldCheck size={24} className="text-secondary" /> Admin Quick Actions
                    </h3>
                    <div className="space-y-3">
                        <button className="w-full py-4 px-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-left transition-all flex items-center justify-between group">
                            <span className="font-bold text-sm">Force DB Backup</span>
                            <ArrowUpRight size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                        </button>
                        <button className="w-full py-4 px-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-left transition-all flex items-center justify-between group">
                            <span className="font-bold text-sm">Clear Cache Nodes</span>
                            <ArrowUpRight size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                        </button>
                        <button className="w-full py-4 px-4 bg-rose-500/20 hover:bg-rose-500/30 rounded-2xl border border-rose-500/30 text-left transition-all flex items-center justify-between group">
                            <span className="font-bold text-sm text-rose-400">Emergency Lockdown</span>
                            <ShieldCheck size={16} className="text-rose-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
