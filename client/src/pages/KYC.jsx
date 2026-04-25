import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Landmark, Smartphone, FileText, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const KYC = () => {
    const { updateUser } = useAuthStore();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [aadhaar, setAadhaar] = useState('');

    const handleDigiLockerLogin = () => {
        setLoading(true);
        // Simulate DigiLocker / Aadhaar Authentication
        setTimeout(() => {
            setLoading(false);
            setStep(2);
            toast.success('Aadhaar Verified via DigiLocker!');
        }, 2000);
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            const res = await axios.post('/api/profiles/kyc', {
                fullName: 'Simulated User', // Could be from an input
                upiId: 'simulated@upi'
            });
            
            updateUser(res.data.user);
            setStep(3);
            toast.success('KYC Completed! Reward eligibility unlocked.');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to complete KYC');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)]">KYC Verification</h1>
                <p className="text-[var(--text-secondary)]">Required to unlock withdrawals and premium rewards.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Progress */}
                <div className="lg:col-span-1 space-y-4">
                    {[
                        { s: 1, t: 'Connect DigiLocker', d: 'Secure Aadhaar access' },
                        { s: 2, t: 'Bank Verification', d: 'Match account name' },
                        { s: 3, t: 'Success', d: 'Unlock Rewards' }
                    ].map((it) => (
                        <div key={it.s} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${step === it.s ? 'bg-primary text-white border-primary shadow-lg' : 'bg-[var(--bg-card)] border-[var(--border)] opacity-60'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === it.s ? 'bg-white text-primary' : 'bg-[var(--bg-light)]'}`}>
                                {step > it.s ? <CheckCircle2 size={20} /> : it.s}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">{it.t}</h4>
                                <p className={`text-xs ${step === it.s ? 'text-blue-100' : 'text-[var(--text-secondary)]'}`}>{it.d}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Content */}
                <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-8 shadow-sm">
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                    <ShieldCheck size={40} />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-center">Identity Verification</h2>
                            <p className="text-center text-[var(--text-secondary)]">
                                VidyaJaya uses DigiLocker for a secure, Aadhaar-based KYC. No physical documents required.
                            </p>
                            
                            <div className="bg-[var(--bg-light)] p-4 rounded-lg border border-[var(--border)] space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle2 size={16} className="text-accent-green" /> <span>Prevents multiple accounts</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle2 size={16} className="text-accent-green" /> <span>Compliant with RBI guidelines</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle2 size={16} className="text-accent-green" /> <span>Instant verification</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleDigiLockerLogin}
                                disabled={loading}
                                className="w-full btn btn-primary flex items-center justify-center gap-2 py-4 text-lg"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <img src="https://www.digilocker.gov.in/assets/img/logo.png" alt="DigiLocker" className="h-6 brightness-0 invert" />}
                                Connect DigiLocker
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                                    <Landmark size={40} />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-center">Bank Account Details</h2>
                            <p className="text-center text-[var(--text-secondary)]">
                                Enter the UPI ID or Bank Account where you want to receive your winnings.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name (As per Bank)</label>
                                    <input type="text" className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-light)]" placeholder="Dheeraj Royal" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">UPI ID / Bank Account Number</label>
                                    <input type="text" className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-light)]" placeholder="9059061099@ybl" />
                                </div>
                            </div>

                            <button 
                                onClick={handleFinalSubmit}
                                disabled={loading}
                                className="w-full btn btn-primary py-4 text-lg"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Confirm & Finalize'}
                            </button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-10 space-y-6">
                            <div className="flex justify-center">
                                <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                                    <CheckCircle2 size={64} />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold">You are Verified!</h2>
                            <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
                                Congratulations! Your KYC is complete. You can now withdraw rewards and compete for premium monthly prizes.
                            </p>
                            <button 
                                onClick={() => window.location.href = '/dashboard'}
                                className="btn btn-primary px-8 py-3"
                            >
                                Back to Dashboard
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KYC;
