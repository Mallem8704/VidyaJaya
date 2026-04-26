import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('/api/auth/login', { email, password });
            
            if (res.data.user.role !== 'admin') {
                toast.error('Access denied. This portal is for administrators only.');
                setLoading(false);
                return;
            }

            setAuth(res.data.user, res.data.token);
            toast.success('Welcome back, Commander.');
            navigate('/admin');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center shadow-2xl shadow-secondary/20 mb-4 border border-white/10">
                        <ShieldCheck size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-white tracking-tight">VidyaJaya <span className="text-secondary">Admin</span></h1>
                    <p className="text-gray-500 text-sm mt-2 uppercase tracking-[0.3em] font-bold">Secure Access Only</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Admin Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@vidyajaya.in"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-secondary transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-secondary transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full bg-secondary text-white font-bold py-4 rounded-2xl hover:bg-secondary-dark transition-all shadow-xl shadow-secondary/20 flex items-center justify-center gap-2 group"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    ENTER CONTROL CENTER 
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <button 
                        onClick={() => navigate('/')}
                        className="text-gray-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                        Return to Site
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
