import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Shield, Users, Layers, Send, Loader, ChevronRight } from 'lucide-react';

const AdminTestCreation = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'UPSC',
        difficulty: 'Medium',
        targetGroup: 'free',
        questionCount: 10,
        llmType: 'groq'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.category) {
            return toast.error("Please fill in all required fields.");
        }

        setLoading(true);
        const loadToast = toast.loading(`Using AI (${formData.llmType.toUpperCase()}) to generate ${formData.questionCount} questions... This may take a minute.`);

        try {
            const res = await axios.post('/api/admin/tests/create-ai-test', formData);
            toast.success(res.data.message, { id: loadToast });
            setFormData({
                title: '',
                category: 'UPSC',
                difficulty: 'Medium',
                targetGroup: 'free',
                questionCount: 10,
                llmType: 'groq'
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate test', { id: loadToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">AI Test Factory</h2>
                    <p className="text-[var(--text-secondary)] mt-1">Create professional mock tests in seconds using advanced LLMs.</p>
                </div>
                <div className="flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-xl border border-secondary/20">
                    <Sparkles size={18} className="fill-secondary" />
                    <span className="text-sm font-bold uppercase tracking-wider">AI Powered</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="card p-8 space-y-6 shadow-xl border-t-4 border-secondary">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                <Send size={14} /> Test Title
                            </label>
                            <input 
                                type="text" 
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. UPSC Prelims 2026: Ancient History Special"
                                className="w-full p-4 bg-[var(--bg-light)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] outline-none focus:border-secondary transition-all"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                    <Layers size={14} /> Exam Category
                                </label>
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-[var(--bg-light)] border border-[var(--border)] rounded-xl outline-none focus:border-secondary"
                                >
                                    <option value="UPSC">UPSC</option>
                                    <option value="SSC">SSC</option>
                                    <option value="Banking">Banking</option>
                                    <option value="RRB">RRB</option>
                                    <option value="Current Affairs">Current Affairs</option>
                                    <option value="State PSC">State PSC</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                    <Brain size={14} /> Difficulty Level
                                </label>
                                <select 
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-[var(--bg-light)] border border-[var(--border)] rounded-xl outline-none focus:border-secondary"
                                >
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Extra High">Extra High</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                    <Users size={14} /> Targeted Users
                                </label>
                                <div className="flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, targetGroup: 'free' }))}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${formData.targetGroup === 'free' ? 'border-primary bg-primary/5 text-primary' : 'border-[var(--border)] text-gray-400'}`}
                                    >
                                        Free Users
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, targetGroup: 'pro' }))}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${formData.targetGroup === 'pro' ? 'border-accent-gold bg-accent-gold/5 text-yellow-700' : 'border-[var(--border)] text-gray-400'}`}
                                    >
                                        👑 Pro Users
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={14} /> Choose AI Engine
                                </label>
                                <div className="flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, llmType: 'groq' }))}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${formData.llmType === 'groq' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-[var(--border)] text-gray-400'}`}
                                    >
                                        Groq (Llama)
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, llmType: 'gemini' }))}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${formData.llmType === 'gemini' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-[var(--border)] text-gray-400'}`}
                                    >
                                        Google Gemini
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest block">Number of Questions: {formData.questionCount}</label>
                            <input 
                                type="range" 
                                min="5" 
                                max="50" 
                                step="5"
                                name="questionCount"
                                value={formData.questionCount}
                                onChange={handleChange}
                                className="w-full accent-secondary"
                            />
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                <span>5 Qs</span>
                                <span>10 Qs</span>
                                <span>20 Qs</span>
                                <span>30 Qs</span>
                                <span>40 Qs</span>
                                <span>50 Qs</span>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 shadow-xl"
                        >
                            {loading ? <Loader className="animate-spin" /> : <Sparkles className="fill-white" />}
                            {loading ? 'AI IS GENERATING...' : 'GENERATE & PUBLISH TEST'}
                        </button>
                    </form>
                </div>

                {/* Info Section */}
                <div className="space-y-6">
                    <div className="card p-6 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/10">
                        <h4 className="font-bold flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2 text-sm">
                            <Brain size={16} /> How it works
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                            When you click generate, our AI will craft conceptual questions based on your requirements. 
                            It will automatically set the duration (1 min/q) and marking scheme (2 marks, 0.5 neg).
                        </p>
                    </div>

                    <div className="card p-6 border-l-4 border-accent-gold bg-yellow-50 dark:bg-yellow-900/10">
                        <h4 className="font-bold flex items-center gap-2 text-yellow-800 dark:text-yellow-300 mb-2 text-sm">
                            <Shield size={16} /> Admin Quality Control
                        </h4>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 leading-relaxed">
                            The "Extra High" level uses advanced prompt engineering to create complex, multi-statement questions similar to the latest UPSC patterns.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-gray-900 text-white space-y-4">
                        <h4 className="font-bold text-sm uppercase tracking-widest text-secondary">Quick Stats</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                                <span className="text-gray-400">Total AI Tests</span>
                                <span className="font-bold">142</span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                                <span className="text-gray-400">Total Questions</span>
                                <span className="font-bold">2,840</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400">AI Success Rate</span>
                                <span className="font-bold text-green-400">99.2%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTestCreation;
