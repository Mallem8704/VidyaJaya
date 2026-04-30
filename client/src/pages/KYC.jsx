import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Landmark, Smartphone, FileText, ArrowRight, Loader2, CheckCircle2, Lock, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const KYC = () => {
    const { user, updateUser } = useAuthStore();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [aadhaar, setAadhaar] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);

    const handleAadhaarSubmit = (e) => {
        e.preventDefault();
        if (aadhaar.length !== 12) {
            return toast.error("Please enter a valid 12-digit Aadhaar number");
        }
        setLoading(true);
        // Simulate sending OTP
        setTimeout(() => {
            setLoading(false);
            setShowOtp(true);
            const last4 = user?.phone ? user.phone.slice(-4) : '3356';
            toast.success(`OTP sent to your registered mobile number ending in ${last4}`);
        }, 1500);
    };

    const handleOtpVerify = (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            return toast.error("Please enter 6-digit OTP");
        }
        setLoading(true);
        // Simulate OTP verification and DigiLocker link
        setTimeout(() => {
            setLoading(false);
            setStep(2);
            toast.success('Aadhaar Verified via DigiLocker!');
        }, 2000);
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            const res = await axios.post('/api/verification/start-kyc', {
                name: user?.name,
                idNumber: aadhaar,
                idType: 'Aadhaar'
            });
            
            setStep(3);
            toast.success(res.data.message);
            updateUser({ ...user, kyc_verified: true });
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to complete KYC');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-[80vh]">
            <header className="mb-10">
                <h1 className="text-4xl font-heading font-black text-[var(--text-primary)] mb-2 flex items-center gap-3">
                    <ShieldCheck className="text-secondary" size={36} /> Identity Hub
                </h1>
                <p className="text-[var(--text-secondary)] font-medium">Secure Aadhaar-based verification for reward eligibility.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Left: Progress Track */}
                <div className="lg:col-span-1 space-y-4">
                    {[
                        { s: 1, t: 'Aadhaar Link', d: 'Secure DigiLocker Auth' },
                        { s: 2, t: 'Bank Setup', d: 'Connect Reward Account' },
                        { s: 3, t: 'Verification', d: 'Unlock Full Benefits' }
                    ].map((it) => (
                        <div key={it.s} className={`p-6 rounded-2xl border-2 flex items-center gap-5 transition-all ${step === it.s ? 'bg-primary text-white border-primary shadow-xl scale-105' : 'bg-[var(--bg-card)] border-[var(--border)] opacity-50'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${step === it.s ? 'bg-white text-primary' : 'bg-[var(--bg-light)] border border-[var(--border)]'}`}>
                                {step > it.s ? <CheckCircle2 size={24} /> : it.s}
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-wider">{it.t}</h4>
                                <p className={`text-[10px] font-bold uppercase tracking-widest opacity-70`}>{it.d}</p>
                            </div>
                        </div>
                    ))}
                    
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-200 dark:border-blue-800/30 text-blue-700 dark:text-blue-400">
                        <div className="flex items-center gap-2 mb-2">
                           <ShieldCheck size={16} /> <span className="font-bold text-xs uppercase">Integration Status</span>
                        </div>
                        <p className="text-[10px] leading-relaxed">
                            The DigiLocker node is currently in **Simulation Mode**. To connect your live Production API, please provide your DigiLocker Partner Credentials in the Admin Panel.
                        </p>
                    </div>
                </div>

                {/* Right: Interaction Zone */}
                <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] p-10 shadow-2xl relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-start">
                                    <h2 className="text-3xl font-black">DigiLocker Auth</h2>
                                    <img src="https://www.digilocker.gov.in/assets/img/logo.png" alt="DigiLocker" className="h-10 object-contain" />
                                </div>
                                
                                {!showOtp ? (
                                    <form onSubmit={handleAadhaarSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">12-Digit Aadhaar Number</label>
                                            <input 
                                                type="text" 
                                                maxLength="12"
                                                value={aadhaar}
                                                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                                                className="w-full p-4 bg-[var(--bg-light)] border-2 border-[var(--border)] rounded-2xl text-2xl font-bold tracking-[0.3em] text-center outline-none focus:border-secondary transition-all"
                                                placeholder="XXXX XXXX XXXX"
                                                required
                                            />
                                        </div>
                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="w-full btn btn-primary py-5 text-lg font-black shadow-xl flex items-center justify-center gap-3"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : <Smartphone size={24} />}
                                            SEND OTP
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleOtpVerify} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Verification Code (Sent to Phone)</label>
                                            <input 
                                                type="text" 
                                                maxLength="6"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                className="w-full p-4 bg-[var(--bg-light)] border-2 border-[var(--border)] rounded-2xl text-2xl font-bold tracking-[0.5em] text-center outline-none focus:border-secondary transition-all"
                                                placeholder="●●●●●●"
                                                required
                                            />
                                        </div>
                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="w-full btn btn-primary py-5 text-lg font-black shadow-xl flex items-center justify-center gap-3"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : <Key size={24} />}
                                            VERIFY & LINK
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowOtp(false)}
                                            className="w-full text-xs font-bold text-gray-400 hover:text-secondary uppercase"
                                        >
                                            Edit Aadhaar Number
                                        </button>
                                    </form>
                                )}
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-start">
                                    <h2 className="text-3xl font-black">Settlement Info</h2>
                                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Landmark size={24} />
                                    </div>
                                </div>
                                <p className="text-[var(--text-secondary)] text-sm">
                                    Link your preferred UPI or Bank details. Rewards will be settled to this account within 24 hours.
                                </p>

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Beneficiary Name</label>
                                        <input type="text" className="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-light)] font-bold" defaultValue={user?.name} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">UPI ID / VPA</label>
                                        <input type="text" className="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-light)] font-bold" placeholder="9059061099@ybl" />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleFinalSubmit}
                                    disabled={loading}
                                    className="w-full btn btn-primary py-5 text-lg font-black shadow-xl"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'AUTHORIZE WITHDRAWALS'}
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ scale: 0.9, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-6 space-y-8"
                            >
                                <div className="flex justify-center relative">
                                    <div className="absolute inset-0 bg-green-400 blur-3xl opacity-20 scale-150 animate-pulse"></div>
                                    <div className="w-28 h-28 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-2xl relative z-10 border-4 border-white">
                                        <CheckCircle2 size={64} />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black mb-2">KYC COMPLETE</h2>
                                    <p className="text-[var(--text-secondary)] text-sm px-10">
                                        Your account is now fully verified. You can compete in prize contests and withdraw your earnings instantly.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => window.location.href = '/wallet'}
                                    className="btn btn-primary px-12 py-4 font-black shadow-xl"
                                >
                                    GO TO WALLET
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default KYC;
