import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Zap, 
    BarChart, 
    TrendingUp, 
    Target, 
    Clock, 
    Brain, 
    Sparkles, 
    AlertCircle,
    ShieldCheck,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProData = async () => {
            try {
                // Fetch specific PRO analytics
                const res = await axios.get('/api/dashboard/pro-analytics');
                setStats(res.data);
            } catch (err) {
                console.error('PRO fetch error:', err);
                if (err.response?.status === 403) {
                    toast.error("PRO Access Required");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProData();
    }, []);

    const mockStats = {
        accuracyTrend: [72, 75, 71, 78, 82, 85, 88],
        speedTrend: [45, 42, 40, 38, 35, 32, 30], // seconds per question
        weakAreas: [
            { name: 'Indian Polity', score: 62, status: 'Improving' },
            { name: 'Modern History', score: 45, status: 'Needs Focus' },
            { name: 'Geography', score: 88, status: 'Mastered' }
        ],
        aiInsight: "Your performance in Indian Polity has improved by 15% this week. However, Modern History requires immediate attention. Focus on 'Governor Generals' and '1857 Revolt'."
    };

    const finalStats = stats || mockStats;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-16 h-16 border-4 border-secondary border-t-white rounded-full animate-spin"></div>
                <p className="text-secondary font-bold font-heading animate-pulse tracking-widest">LOADING PRO INSIGHTS...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* PRO Header */}
            <div className="bg-gradient-to-r from-gray-900 via-primary to-gray-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-white/10">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck className="text-accent-gold" size={24} />
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent-gold">Exclusive PRO Access</span>
                        </div>
                        <h1 className="text-4xl font-heading font-bold mb-3">Advanced <span className="text-secondary">AI Analytics</span></h1>
                        <p className="text-gray-300 max-w-lg">Deep dive into your performance. Identify bottlenecks, master weak areas, and dominate the leaderboard.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-center border border-white/10 min-w-[100px]">
                            <p className="text-2xl font-bold text-accent-gold">88%</p>
                            <p className="text-[10px] uppercase tracking-tighter opacity-60">Avg Accuracy</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-center border border-white/10 min-w-[100px]">
                            <p className="text-2xl font-bold text-secondary">32s</p>
                            <p className="text-[10px] uppercase tracking-tighter opacity-60">Avg Speed</p>
                        </div>
                    </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 -mr-10 -mb-10">
                    <BarChart size={300} />
                </div>
            </div>

            {/* AI Insights Card */}
            <div className="card bg-secondary/5 border-2 border-secondary/20 p-6 flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-secondary/5">
                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-secondary/20">
                    <Brain className="text-white" size={32} />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-secondary uppercase tracking-widest">AI Personalized Insight</span>
                        <div className="h-1 w-1 bg-secondary rounded-full animate-ping" />
                    </div>
                    <p className="text-sm md:text-base leading-relaxed font-medium">{finalStats.aiInsight}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Accuracy Card */}
                <div className="card p-8 border border-[var(--border)] group hover:border-secondary transition-all">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <TrendingUp className="text-secondary" size={24} /> Accuracy Trends
                        </h3>
                        <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                            +12% <ArrowUpRight size={14}/>
                        </span>
                    </div>
                    <div className="h-48 flex items-end gap-3 justify-between px-2">
                        {finalStats.accuracyTrend.map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${val}%` }}
                                    className="w-full bg-gradient-to-t from-secondary/40 to-secondary rounded-t-lg relative group"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {val}%
                                    </div>
                                </motion.div>
                                <span className="text-[10px] font-bold text-gray-400">Day {i+1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Speed Card */}
                <div className="card p-8 border border-[var(--border)] group hover:border-primary transition-all">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <Clock className="text-primary" size={24} /> Speed Analysis
                        </h3>
                        <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg flex items-center gap-1">
                            -13s <ArrowUpRight size={14} className="rotate-90"/>
                        </span>
                    </div>
                    <div className="h-48 flex items-end gap-3 justify-between px-2">
                        {finalStats.speedTrend.map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(val/50)*100}%` }}
                                    className="w-full bg-gradient-to-t from-primary/40 to-primary rounded-t-lg relative group"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {val}s
                                    </div>
                                </motion.div>
                                <span className="text-[10px] font-bold text-gray-400">Day {i+1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Weak Areas */}
            <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Target className="text-red-500" size={28} /> Subject-Wise Breakthrough
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {finalStats.weakAreas.map((area, i) => (
                        <div key={i} className="card p-6 border border-[var(--border)] hover:border-primary/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="font-bold text-lg">{area.name}</h4>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
                                    area.status === 'Mastered' ? 'bg-green-100 text-green-600' :
                                    area.status === 'Improving' ? 'bg-blue-100 text-blue-600' :
                                    'bg-red-100 text-red-600'
                                }`}>
                                    {area.status}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-gray-500">Current Accuracy</span>
                                    <span>{area.score}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${area.score}%` }}
                                        className={`h-full ${
                                            area.score > 80 ? 'bg-green-500' :
                                            area.score > 50 ? 'bg-blue-500' :
                                            'bg-red-500'
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* PRO CTA */}
            <div className="card p-10 bg-[var(--bg-light)] border border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-8 group">
                <div>
                    <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        Ready for the next level? <Sparkles className="text-accent-gold" size={24} />
                    </h3>
                    <p className="text-[var(--text-secondary)]">Take a full-length mock test today to refine your AI performance report.</p>
                </div>
                <button className="btn btn-primary px-8 py-4 flex items-center gap-2 shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform">
                    Launch Mock Test <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default ProDashboard;
