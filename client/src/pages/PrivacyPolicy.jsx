import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Privacy Policy | VidyaJaya";
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-200 py-20">
            <div className="max-w-4xl mx-auto px-6">
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-primary font-bold mb-12 hover:gap-3 transition-all"
                >
                    <ChevronLeft size={20} /> Back to Home
                </button>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-heading font-black">Privacy Policy</h1>
                            <p className="text-slate-500 font-medium">Last Updated: April 30, 2026</p>
                        </div>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <Eye size={20} className="text-primary" /> 1. Introduction
                            </h2>
                            <p className="leading-relaxed">
                                Welcome to **VidyaJaya** ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (vidyajaya.in) or use our application.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <FileText size={20} className="text-primary" /> 2. Information We Collect
                            </h2>
                            <p className="mb-4">We collect personal information that you voluntarily provide to us when you register on the platform, including:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>**Identity Data:** Name, email address, and phone number.</li>
                                <li>**Authentication Data:** Login credentials via Google Auth or Email/Password.</li>
                                <li>**KYC Data:** If you opt for rewards withdrawal, we process your Aadhaar details via encrypted DigiLocker nodes. We do not store your full Aadhaar number on our local servers.</li>
                                <li>**Transaction Data:** Details about payments to and from you and other details of products and services you have purchased from us.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <Lock size={20} className="text-primary" /> 3. How We Use Your Information
                            </h2>
                            <p className="mb-4">We use the information we collect for various purposes, including:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>To provide, operate, and maintain our platform.</li>
                                <li>To process your mock test results and update the leaderboard.</li>
                                <li>To manage your rewards, coins, and withdrawals.</li>
                                <li>To communicate with you about your account and platform updates.</li>
                                <li>To prevent fraudulent activities and ensure platform integrity.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <Shield size={20} className="text-primary" /> 4. Data Security
                            </h2>
                            <p className="leading-relaxed">
                                We implement a variety of security measures to maintain the safety of your personal information. We use industry-standard encryption (SSL) for all data transmissions. Access to your personal data is restricted to authorized employees and service providers who need to know that information to process it for us.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <FileText size={20} className="text-primary" /> 5. Third-Party Services
                            </h2>
                            <p className="leading-relaxed">
                                We may use third-party services like **Razorpay** for payment processing and **Supabase** for database management. These third parties have their own privacy policies regarding how they handle your information. We recommend that you read their privacy policies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <Lock size={20} className="text-primary" /> 6. Contact Us
                            </h2>
                            <p className="leading-relaxed">
                                If you have any questions or concerns about this Privacy Policy, please contact us at:
                                <br />
                                **Email:** support@vidyajaya.in
                                <br />
                                **Location:** Kadiri, Andhra Pradesh, India
                            </p>
                        </section>
                    </div>
                </motion.div>
                
                <p className="text-center text-slate-400 text-sm mt-12">
                    © 2026 VidyaJaya Technologies Pvt Ltd. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
