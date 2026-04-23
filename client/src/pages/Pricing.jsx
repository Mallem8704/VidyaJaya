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

    const handlePayment = async (plan) => {
        if (!user) {
            toast.error("Please login to upgrade to PRO");
            return;
        }

        setLoading(true);
        const loadToast = toast.loading("Preparing checkout...");

        try {
            // 1. Create Order on Server
            const amount = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const { data: order } = await axios.post('/api/payments/create-order', {
                amount,
                planName: plan.name
            });

            // 2. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Should be in client .env
                amount: order.amount,
                currency: order.currency,
                name: "VidyaJaya PRO",
                description: `Upgrade to ${plan.name}`,
                order_id: order.id,
                handler: async (response) => {
                    try {
                        // 3. Verify Payment on Server
                        const verifyRes = await axios.post('/api/payments/verify', {
                            ...response,
                            planName: plan.name
                        });
                        toast.success(verifyRes.data.message);
                        loadUser(); // Refresh user status
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
            name: "Pro",
            monthlyPrice: 99,
            annualPrice: 69,
            description: "Everything you need to clear UPSC/SSC.",
            features: [
                "Unlimited Daily Tests",
                "UPSC & 5 other sectors",
                "Weekly Cash Rewards (Top 3)",
                "AI Performance Analysis",
                "Unlimited AI Doubt Solving",
                "Coin Earning + Streak Freeze"
            ],
            popular: true
        }
    ];

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-heading font-bold mb-4">Simple, Transparent Pricing</h2>
                <p className="text-[var(--text-secondary)]">Start free. Upgrade when you're ready to win.</p>
                
                <div className="flex items-center justify-center gap-4 mt-8">
                    <span className={`text-sm ${!isAnnual ? 'font-bold text-primary' : 'text-gray-500'}`}>Monthly</span>
                    <button 
                        onClick={() => setIsAnnual(!isAnnual)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${isAnnual ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isAnnual ? 'translate-x-6' : ''}`} />
                    </button>
                    <span className={`text-sm ${isAnnual ? 'font-bold text-primary' : 'text-gray-500'}`}>Annual <span className="text-green-500 font-bold">(Save 30%)</span></span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-md mx-auto">
                {plans.map((plan, idx) => (
                    <motion.div 
                        whileHover={{ y: -5 }}
                        key={idx} 
                        className={`card p-8 border-2 ${plan.popular ? 'border-primary' : 'border-[var(--border)]'} relative`}
                    >
                        {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full">MOST POPULAR</span>}
                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <div className="text-4xl font-bold mb-4">
                            ₹{isAnnual ? plan.annualPrice : plan.monthlyPrice}
                            <span className="text-lg text-gray-500 font-normal"> / month</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-8">{plan.description}</p>
                        
                        <div className="space-y-4 mb-8">
                            {plan.features.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                    <div className="bg-green-100 text-green-600 p-1 rounded-full"><Check size={12}/></div>
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>

                        {user?.is_premium ? (
                            <button className="btn btn-primary w-full bg-green-500 border-none flex items-center justify-center gap-2 cursor-default">
                                <ShieldCheck size={20}/> Active PRO Member
                            </button>
                        ) : (
                            <button 
                                onClick={() => handlePayment(plan)}
                                disabled={loading}
                                className="btn btn-primary w-full pulse-glow flex items-center justify-center gap-2"
                            >
                                <Zap size={18}/> Upgrade to PRO Now
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>
            
            <div className="mt-12 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <Award size={14}/> 100% Secure Payments via Razorpay
            </div>
        </div>
    );
};

export default Pricing;
