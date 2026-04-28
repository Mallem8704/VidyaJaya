import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Copy, 
    Share2, 
    Users, 
    Trophy, 
    ArrowRight, 
    CheckCircle, 
    TrendingUp,
    Gift,
    Smartphone
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReferAndEarn = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/referrals/my-stats');
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching referral stats:', err);
            toast.error("Failed to load referral data");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        toast.success(`${type} copied to clipboard!`);
    };

    const shareOnWhatsapp = () => {
        const text = `Hey! Join me on VidyaJaya 2.0 and conquer UPSC/SSC with AI. Use my code ${stats?.referralCode} or this link: ${stats?.referralLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {/* Hero Section */}
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-dark p-8 md:p-12 overflow-hidden text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-20"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-accent-purple rounded-full blur-[100px] opacity-10"></div>

                <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 mb-4 inline-block">
                                Growth Rewards Program
                            </span>
                            <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight">
                                Invite Friends, <br />
                                <span className="text-secondary">Earn PRO Days</span>
                            </h1>
                            <p className="text-white/70 text-lg max-w-md mt-4">
                                Help your peers succeed with AI-powered preparation and unlock free subscription months for yourself.
                            </p>
                        </motion.div>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl">
                                <p className="text-white/60 text-xs font-medium mb-1">Your Referral Code</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-black tracking-widest text-secondary">{stats?.referralCode}</span>
                                    <button 
                                        onClick={() => copyToClipboard(stats?.referralCode, "Code")}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center md:justify-end">
                        <div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <Share2 size={20} className="text-secondary" /> Share Instant Link
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-black/20 p-3 rounded-xl flex items-center justify-between border border-white/5">
                                    <p className="text-xs truncate max-w-[200px] font-mono text-white/50">{stats?.referralLink}</p>
                                    <button 
                                        onClick={() => copyToClipboard(stats?.referralLink, "Link")}
                                        className="text-secondary hover:text-white transition-colors"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                                <button 
                                    onClick={shareOnWhatsapp}
                                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#25D366]/20"
                                >
                                    <Smartphone size={20} /> Share on WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress & Milestone Section */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 card p-8 bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Trophy size={120} />
                    </div>
                    
                    <h3 className="text-xl font-heading font-bold mb-8 flex items-center gap-2">
                        <TrendingUp size={20} className="text-secondary" /> Reward Progress
                    </h3>

                    <div className="space-y-10 relative z-10">
                        {/* Progress Bar Container */}
                        <div className="relative">
                            <div className="h-4 bg-[var(--bg-light)] rounded-full overflow-hidden border border-[var(--border)]">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats?.progress || 0}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-secondary to-accent-gold"
                                />
                            </div>
                            
                            {/* Milestone Markers */}
                            <div className="absolute top-1/2 -translate-y-1/2 left-[50%] -ml-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${stats?.successfulReferrals >= 5 ? 'bg-secondary border-secondary text-white' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)]'}`}>
                                    {stats?.successfulReferrals >= 5 ? <CheckCircle size={12} /> : <span className="text-[10px] font-bold">5</span>}
                                </div>
                                <span className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[var(--text-secondary)] whitespace-nowrap">1 Week Free</span>
                            </div>
                            
                            <div className="absolute top-1/2 -translate-y-1/2 left-[100%] -ml-6">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${stats?.successfulReferrals >= 10 ? 'bg-secondary border-secondary text-white' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)]'}`}>
                                    {stats?.successfulReferrals >= 10 ? <CheckCircle size={12} /> : <span className="text-[10px] font-bold">10</span>}
                                </div>
                                <span className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[var(--text-secondary)] whitespace-nowrap">1 Month Free</span>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-between items-end">
                            <div>
                                <p className="text-3xl font-black text-secondary">{stats?.successfulReferrals}</p>
                                <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Successful Conversions</p>
                            </div>
                            {stats?.nextMilestone > 0 ? (
                                <div className="text-right">
                                    <p className="text-sm text-[var(--text-secondary)] font-medium mb-1">Next Milestone: <span className="text-primary font-bold">{stats?.nextMilestone} Referrals</span></p>
                                    <p className="text-xs text-[var(--text-secondary)]">Onboard {stats?.nextMilestone - stats?.successfulReferrals} more friends to unlock rewards.</p>
                                </div>
                            ) : (
                                <div className="px-4 py-2 bg-accent-green/10 border border-accent-green/20 rounded-xl text-accent-green text-sm font-bold flex items-center gap-2">
                                    <Trophy size={16} /> All Milestones Achieved!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card p-8 bg-[var(--bg-card)] border border-[var(--border)] flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6">
                            <Gift size={24} />
                        </div>
                        <h3 className="text-lg font-heading font-bold mb-2">How it works</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-[10px] font-bold shrink-0">1</div>
                                <p className="text-sm text-[var(--text-secondary)]">Invite friends using your link or code.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-[10px] font-bold shrink-0">2</div>
                                <p className="text-sm text-[var(--text-secondary)]">They join and subscribe to any PRO plan.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-[10px] font-bold shrink-0">3</div>
                                <p className="text-sm text-[var(--text-secondary)]">You get a notification and free PRO access!</p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8">
                        <button className="w-full btn btn-outline py-3 flex items-center justify-center gap-2 text-xs">
                            View Terms <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Referral History Table */}
            <div className="space-y-4">
                <h3 className="text-xl font-heading font-bold flex items-center gap-2 px-2">
                    <Users size={20} className="text-secondary" /> Recent Referrals
                </h3>
                <div className="card overflow-hidden border border-[var(--border)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--bg-light)] text-[var(--text-secondary)] text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4">Joined Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Reward</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {stats?.referrals?.length > 0 ? stats.referrals.map((ref, idx) => (
                                    <tr key={idx} className="hover:bg-[var(--bg-light)] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {ref.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-sm">{ref.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-[var(--text-secondary)]">
                                            {new Date(ref.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ref.status === 'Successful' ? 'bg-accent-green/10 text-accent-green' : 'bg-yellow-400/10 text-yellow-600'}`}>
                                                {ref.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium">
                                            {ref.status === 'Successful' ? 'Reward Credited' : '--'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-[var(--text-secondary)]">
                                            <p className="font-medium">No referrals found yet.</p>
                                            <p className="text-xs mt-1">Start sharing your link to earn rewards!</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferAndEarn;
