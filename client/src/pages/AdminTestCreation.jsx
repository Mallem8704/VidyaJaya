import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, Brain, Shield, Users, Layers, Send, Loader, 
    Trash2, Edit, Save, X, Trash
} from 'lucide-react';

const AdminTestCreation = () => {
    const [loading, setLoading] = useState(false);
    const [tests, setTests] = useState([]);
    const [fetchingTests, setFetchingTests] = useState(true);
    const [editingTestId, setEditingTestId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        category: '',
        is_premium: false
    });

    const [formData, setFormData] = useState({
        title: '',
        category: 'UPSC',
        difficulty: 'Medium',
        targetGroup: 'free',
        questionCount: 10,
        llmType: 'groq'
    });

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setFetchingTests(true);
        try {
            const res = await axios.get('/api/admin/tests');
            setTests(res.data);
        } catch (err) {
            toast.error("Failed to fetch existing tests");
        } finally {
            setFetchingTests(false);
        }
    };

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
            fetchTests(); // Refresh the list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate test', { id: loadToast });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this test? All questions and submissions for this test will be permanently removed.")) return;

        try {
            await axios.delete(`/api/admin/tests/${id}`);
            toast.success("Test deleted successfully");
            setTests(tests.filter(t => t.id !== id));
        } catch (err) {
            toast.error("Failed to delete test");
        }
    };

    const startEditing = (test) => {
        setEditingTestId(test.id);
        setEditFormData({
            title: test.title,
            category: test.category,
            is_premium: test.is_premium
        });
    };

    const handleEditSave = async (id) => {
        try {
            await axios.put(`/api/admin/tests/${id}`, editFormData);
            toast.success("Test updated successfully");
            setTests(tests.map(t => t.id === id ? { ...t, ...editFormData } : t));
            setEditingTestId(null);
        } catch (err) {
            toast.error("Failed to update test");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">AI Test Factory</h2>
                    <p className="text-[var(--text-secondary)] mt-1">Create and manage professional mock tests using advanced LLMs.</p>
                </div>
                <div className="flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-xl border border-secondary/20">
                    <Sparkles size={18} className="fill-secondary" />
                    <span className="text-sm font-bold uppercase tracking-wider">AI Powered</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Creation Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="card p-8 space-y-6 shadow-xl border-t-4 border-secondary bg-white dark:bg-gray-900">
                        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-[var(--border)] pb-4 mb-4">
                            <Sparkles size={20} className="text-secondary" /> Generate New Test
                        </h3>

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
                                        Free
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, targetGroup: 'pro' }))}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${formData.targetGroup === 'pro' ? 'border-accent-gold bg-accent-gold/5 text-yellow-700' : 'border-[var(--border)] text-gray-400'}`}
                                    >
                                        👑 Pro
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={14} /> AI Engine
                                </label>
                                <div className="flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, llmType: 'groq' }))}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${formData.llmType === 'groq' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-[var(--border)] text-gray-400'}`}
                                    >
                                        Groq
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, llmType: 'gemini' }))}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${formData.llmType === 'gemini' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-[var(--border)] text-gray-400'}`}
                                    >
                                        Gemini
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
                                className="w-full accent-secondary cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                <span>5 Qs</span>
                                <span>25 Qs</span>
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

                {/* Quick Info & Tips */}
                <div className="space-y-6">
                    <div className="card p-6 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/10">
                        <h4 className="font-bold flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2 text-sm">
                            <Brain size={16} /> Strategy Tip
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                            Use **Gemini** for multi-statement UPSC questions and **Groq** for rapid-fire SSC/Banking mocks.
                        </p>
                    </div>

                    <div className="card p-6 bg-gray-900 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                        <h4 className="text-secondary font-bold uppercase tracking-widest text-[10px] mb-2">Live Status</h4>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-3xl font-bold font-heading">{tests.length}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Total Published Tests</p>
                            </div>
                            <Activity className="text-secondary mb-1" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Management Table */}
            <div className="card border-[var(--border)] shadow-xl overflow-hidden bg-white dark:bg-gray-900">
                <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Layers size={20} className="text-secondary" /> Manage Published Tests
                    </h3>
                    {fetchingTests && <Loader className="animate-spin text-secondary" size={20} />}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">
                                <th className="px-6 py-4">Test Title</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Questions</th>
                                <th className="px-6 py-4">Created At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {tests.length === 0 && !fetchingTests && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">No tests created yet. Use the factory above to build one!</td>
                                </tr>
                            )}
                            {tests.map(test => (
                                <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        {editingTestId === test.id ? (
                                            <input 
                                                type="text" 
                                                value={editFormData.title}
                                                onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                                                className="w-full p-2 bg-[var(--bg-light)] border border-secondary rounded-lg outline-none"
                                            />
                                        ) : (
                                            <span className="font-bold text-sm text-[var(--text-primary)]">{test.title}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingTestId === test.id ? (
                                            <select 
                                                value={editFormData.category}
                                                onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                                                className="p-2 bg-[var(--bg-light)] border border-secondary rounded-lg outline-none"
                                            >
                                                <option value="UPSC">UPSC</option>
                                                <option value="SSC">SSC</option>
                                                <option value="Banking">Banking</option>
                                                <option value="RRB">RRB</option>
                                                <option value="Current Affairs">Current Affairs</option>
                                            </select>
                                        ) : (
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] font-bold uppercase tracking-wider">{test.category}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingTestId === test.id ? (
                                            <select 
                                                value={editFormData.is_premium ? 'pro' : 'free'}
                                                onChange={e => setEditFormData({ ...editFormData, is_premium: e.target.value === 'pro' })}
                                                className="p-2 bg-[var(--bg-light)] border border-secondary rounded-lg outline-none"
                                            >
                                                <option value="free">Free</option>
                                                <option value="pro">Pro</option>
                                            </select>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${test.is_premium ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {test.is_premium ? '👑 Pro' : 'Free'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                                        {test.total_questions} Qs
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-400">
                                        {new Date(test.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {editingTestId === test.id ? (
                                                <>
                                                    <button onClick={() => handleEditSave(test.id)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-lg">
                                                        <Save size={16} />
                                                    </button>
                                                    <button onClick={() => setEditingTestId(null)} className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEditing(test)} className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(test.id)} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const Activity = ({ className, size }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

export default AdminTestCreation;
