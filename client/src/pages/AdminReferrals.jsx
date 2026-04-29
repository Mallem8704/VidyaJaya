import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Users, 
    DollarSign, 
    Code, 
    Search, 
    Filter, 
    CheckCircle, 
    XCircle,
    Plus,
    ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminReferrals = () => {
    const [referrals, setReferrals] = useState([]);
    const [commissions, setCommissions] = useState([]);
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('logs'); // 'logs', 'commissions', 'codes'
    
    // New Code Modal State
    const [showModal, setShowModal] = useState(false);
    const [newCode, setNewCode] = useState({ code: '', type: 'influencer', owner_email: '', commission_percent: 10 });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'logs') {
                const res = await axios.get('/api/admin/referrals');
                setReferrals(res.data);
            } else if (activeTab === 'commissions') {
                const res = await axios.get('/api/admin/commissions');
                setCommissions(res.data);
            } else if (activeTab === 'codes') {
                const res = await axios.get('/api/admin/referral-codes');
                setCodes(res.data);
            }
        } catch (err) {
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        toast.success(`${type} copied to clipboard!`);
    };

    const handleCreateCode = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/referral-codes', newCode);
            toast.success("Referral code created!");
            setShowModal(false);
            setNewCode({ code: '', type: 'influencer', owner_email: '', commission_percent: 10 });
            if (activeTab === 'codes') fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Creation failed");
        }
    };

    const handleDeleteCode = async (id) => {
        if (!window.confirm("Are you sure? This will disable this referral code permanently.")) return;
        try {
            await axios.delete(`/api/admin/referral-codes/${id}`);
            toast.success("Code deleted");
            fetchData();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const handleMarkPaid = async (id) => {
        try {
            await axios.post(`/api/admin/commissions/${id}/pay`);
            toast.success("Commission marked as paid");
            fetchData();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">Referral Management</h1>
                    <p className="text-[var(--text-secondary)] text-sm">Monitor referrals, influencers, and payouts.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> Create Influencer Code
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--border)] gap-8">
                {['logs', 'commissions', 'codes'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === tab ? 'text-primary' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        {tab === 'logs' ? 'Referral Logs' : tab === 'commissions' ? 'Influencer Payouts' : 'Active Codes'}
                        {activeTab === tab && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                <div className="card border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
                    <div className="overflow-x-auto">
                        {activeTab === 'logs' && (
                            <table className="w-full text-left">
                                <thead className="bg-[var(--bg-light)] text-[var(--text-secondary)] text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Referrer</th>
                                        <th className="px-6 py-4">Referee (User)</th>
                                        <th className="px-6 py-4">Code</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {referrals.map((ref) => (
                                        <tr key={ref.id} className="hover:bg-[var(--bg-light)] transition-colors text-sm">
                                            <td className="px-6 py-4">
                                                <div className="font-bold">{ref.referrer?.name}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">{ref.referrer?.email}</div>
                                                <div className="mt-1"><span className={`text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase`}>{ref.referrer?.referral_type}</span></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{ref.referee?.name}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">{ref.referee?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-primary">{ref.referral_code}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${ref.is_successful ? 'bg-accent-green/10 text-accent-green' : 'bg-yellow-400/10 text-yellow-600'}`}>
                                                    {ref.is_successful ? 'Converted' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-[var(--text-secondary)]">
                                                {new Date(ref.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'commissions' && (
                            <table className="w-full text-left">
                                <thead className="bg-[var(--bg-light)] text-[var(--text-secondary)] text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Influencer</th>
                                        <th className="px-6 py-4">Referee</th>
                                        <th className="px-6 py-4">Commission</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {commissions.map((comm) => (
                                        <tr key={comm.id} className="hover:bg-[var(--bg-light)] transition-colors text-sm">
                                            <td className="px-6 py-4">
                                                <div className="font-bold">{comm.referrer?.name || 'Unknown'}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">{comm.referrer?.email || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold">{comm.referee?.name || 'Student'}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">{comm.referee?.email || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-black text-accent-green">₹{comm.commission_amount}</div>
                                                <div className="text-[10px] text-[var(--text-secondary)]">On ₹{comm.subscription_amount}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${comm.status === 'paid' ? 'bg-accent-green text-white' : 'bg-orange-400 text-white'}`}>
                                                    {comm.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {comm.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleMarkPaid(comm.id)}
                                                        className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                                        title="Mark as Paid"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'codes' && (
                            <table className="w-full text-left">
                                <thead className="bg-[var(--bg-light)] text-[var(--text-secondary)] text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Owner</th>
                                            <th className="px-6 py-4">Code</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Commission</th>
                                            <th className="px-6 py-4 text-center">Share Link</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {codes.map((c) => (
                                            <tr key={c.id} className="hover:bg-[var(--bg-light)] transition-colors text-sm">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold">{c.owner?.name}</div>
                                                    <div className="text-xs text-[var(--text-secondary)]">{c.owner?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 font-mono font-bold text-primary">{c.code}</td>
                                                <td className="px-6 py-4 uppercase text-[10px] font-black">{c.type}</td>
                                                <td className="px-6 py-4 font-bold">{c.commission_percent}%</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={() => copyToClipboard(`https://vidyajaya.in/signup?ref=${c.code}`, "Referral Link")}
                                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-full"
                                                    >
                                                        <ExternalLink size={12} /> COPY LINK
                                                    </button>
                                                </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => handleDeleteCode(c.id)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete Code"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Create Code Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-md p-6 border border-[var(--border)]"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-heading font-bold">New Influencer Code</h2>
                            <button onClick={() => setShowModal(false)} className="text-[var(--text-secondary)] hover:text-red-500"><XCircle size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateCode} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-[var(--text-secondary)] mb-1">Owner Email</label>
                                <input 
                                    type="email" required
                                    value={newCode.owner_email} onChange={e => setNewCode({...newCode, owner_email: e.target.value})}
                                    className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-light)] focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="influencer@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-[var(--text-secondary)] mb-1">Custom Code</label>
                                <input 
                                    type="text" required
                                    value={newCode.code} onChange={e => setNewCode({...newCode, code: e.target.value})}
                                    className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-light)] focus:ring-2 focus:ring-primary outline-none uppercase"
                                    placeholder="RAHUL10"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-[var(--text-secondary)] mb-1">Commission %</label>
                                <input 
                                    type="number" required
                                    value={newCode.commission_percent} onChange={e => setNewCode({...newCode, commission_percent: e.target.value})}
                                    className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-light)] focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <button type="submit" className="w-full btn btn-primary py-4 font-bold">Create Code</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminReferrals;
