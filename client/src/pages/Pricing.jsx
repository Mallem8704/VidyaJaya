import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { Check, Zap, Award, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Pricing = () => {
    const { user, loadUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [isAnnual, setIsAnnual] = useState(false);

    const handlePayment = async (plan, planType) => {
        if (!user) {
            toast.error("Please login to upgrade to PRO");
            return;
        }

        setLoading(true);
        const loadToast = toast.loading("Preparing checkout...");

        try {
            // 1. Create Order on Server
            const { data: order } = await axios.post('/api/payments/create-order', {
                planType
            });

            // 2. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SgtHYjaxxDOJUk',
                amount: order.amount,
                currency: order.currency,
                name: "VidyaJaya PRO",
                description: `Upgrade to PRO ${planType.toUpperCase()} Plan`,
                order_id: order.id,
                handler: async (response) => {
                    try {
                        // 3. Verify Payment on Server
                        const verifyRes = await axios.post('/api/payments/verify', {
                            ...response,
                            planType
                        });
                        toast.success(verifyRes.data.message);
                        setTimeout(() => {
                            window.location.href = '/dashboard';
                        }, 2000);
                    } catch (err) {
                        toast.error("Payment verification failed!");
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || ""
                },
                theme: {
                    color: "#FF6B00"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            toast.dismiss(loadToast);
        } catch (err) {
            console.error(err);
            toast.error("Failed to initiate payment");
            toast.dismiss(loadToast);
        } finally {
            setLoading(false);
        }
    };

    const plans = [
        {
            id: 'weekly',
            name: "PRO Weekly",
            price: 99,
            duration: "week",
            description: "Perfect for quick exam revision.",
            features: [
                "Unlock PRO Leaderboard",
                "Advanced AI Performance Analytics",
                "Double Rewards for Accuracy",
                "Unlimited AI Doubt Solving",
                "UPSC, SSC & Banking mock tests",
                "Premium 'PRO' Badge"
            ],
            popular: false
        },
        {
            id: 'monthly',
            name: "PRO Monthly",
            price: 299,
            duration: "month",
            description: "Best for serious UPSC aspirants.",
            features: [
                "All Weekly Plan Features",
                "Eligibility for Cash Rewards",
                "Monthly Performance Report",
                "3x Coins on Daily Streaks",
                "Early access to new tests",
                "Priority Support"
            ],
            popular: true
        }
    ];

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 animate-fade-in">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold mb-4">
                    <Zap size={14} className="fill-primary" /> LIMITED TIME OFFER
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">Unlock Your <span className="text-primary">True Potential</span></h2>
                <p className="text-[var(--text-secondary)] max-w-xl mx-auto">Join thousands of students using VidyaJaya PRO to clear India's toughest exams.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {plans.map((plan, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -8 }}
                        key={idx} 
                        className={`card p-8 border-2 transition-all duration-300 ${plan.popular ? 'border-primary shadow-xl shadow-primary/10' : 'border-[var(--border)] hover:border-primary/50'} relative`}
                    >
                        {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">BEST VALUE</span>}
                        
                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                {plan.name} 
                                {plan.popular && <Award className="text-yellow-500" size={20} />}
                            </h3>
                            <p className="text-sm text-gray-500">{plan.description}</p>
                        </div>

                        <div className="text-5xl font-bold mb-8">
                            ₹{plan.price}
                            <span className="text-lg text-gray-500 font-normal"> / {plan.duration}</span>
                        </div>
                        
                        <div className="space-y-4 mb-10">
                            {plan.features.map((f, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm">
                                    <div className="bg-green-100 dark:bg-green-900/30 text-green-600 p-1 rounded-full mt-0.5 shrink-0"><Check size={12}/></div>
                                    <span className="text-[var(--text-secondary)]">{f}</span>
                                </div>
                            ))}
                        </div>

                        {user?.is_pro ? (
                            <button className="btn btn-primary w-full bg-green-500 border-none flex items-center justify-center gap-2 cursor-default">
                                <ShieldCheck size={20}/> Active PRO Member
                            </button>
                        ) : (
                            <button 
                                onClick={() => handlePayment(plan, plan.id)}
                                disabled={loading}
                                className={`btn w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all active:scale-95 ${plan.popular ? 'btn-primary pulse-glow' : 'bg-gray-100 dark:bg-gray-800 text-[var(--text-primary)] hover:bg-gray-200'}`}
                            >
                                <Zap size={18} className={plan.popular ? 'fill-white' : 'fill-primary'} /> 
                                {loading ? 'Processing...' : `Get ${plan.name}`}
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>
            
            <div className="mt-16 bg-[var(--bg-light)] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-[var(--border)]">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                        <ShieldCheck size={40} />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">Money-Back Guarantee</h4>
                        <p className="text-sm text-[var(--text-secondary)]">Not satisfied? Get a full refund within 24 hours.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold">100%</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Secure</p>
                    </div>
                    <div className="w-[1px] h-10 bg-[var(--border)]"></div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">Razorpay</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Partner</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
