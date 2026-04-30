import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Gavel, Scale, AlertTriangle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Terms of Service | VidyaJaya";
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
                            <Gavel size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-heading font-black">Terms of Service</h1>
                            <p className="text-slate-500 font-medium">Effective Date: April 30, 2026</p>
                        </div>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <Scale size={20} className="text-primary" /> 1. Acceptance of Terms
                            </h2>
                            <p className="leading-relaxed">
                                By accessing or using **VidyaJaya**, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our platform. These terms apply to all visitors, users, and others who access the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <FileText size={20} className="text-primary" /> 2. Platform Description
                            </h2>
                            <p className="leading-relaxed">
                                VidyaJaya is a skill-based educational subscription platform. We provide AI-powered mock tests, performance analytics, and rewards for educational excellence. We are **not** a gambling or betting platform. All rewards are performance-based bonuses distributed from our subscription revenue.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <AlertTriangle size={20} className="text-primary" /> 3. User Accounts & Fair Play
                            </h2>
                            <p className="mb-4">When you create an account, you agree to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide accurate and complete information.</li>
                                <li>Maintain only **one account** per individual. Multiple accounts for a single person will result in a permanent ban.</li>
                                <li>Not use any AI tools, external aids, or cheating mechanisms during tests. Our platform employs proctoring measures (fullscreen enforcement, tab monitoring) to ensure integrity.</li>
                                <li>Be responsible for maintaining the confidentiality of your password.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <Scale size={20} className="text-primary" /> 4. Subscriptions & Refunds
                            </h2>
                            <p className="mb-4">VidyaJaya offers Weekly and Monthly PRO subscriptions:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Payments are processed securely via **Razorpay**.</li>
                                <li>Subscriptions are non-refundable except in cases of double-billing or technical failure as determined by our support team.</li>
                                <li>You may cancel your subscription at any time, but access to PRO features will continue until the end of the current billing cycle.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <FileText size={20} className="text-primary" /> 5. Reward Payouts
                            </h2>
                            <p className="leading-relaxed">
                                Reward payouts (coins to cash) are subject to identity verification (KYC). We reserve the right to withhold payouts if we detect any suspicious activity, multi-accounting, or cheating. Minimum withdrawal limits apply as stated in the rewards section of the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <Scale size={20} className="text-primary" /> 6. Limitation of Liability
                            </h2>
                            <p className="leading-relaxed">
                                VidyaJaya shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the platform. While we strive for 100% accuracy in our AI-generated questions, we are not responsible for errors or omissions in the test content.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <Gavel size={20} className="text-primary" /> 7. Governing Law
                            </h2>
                            <p className="leading-relaxed">
                                These Terms shall be governed and construed in accordance with the laws of India. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts in Kadiri, Andhra Pradesh.
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

export default TermsOfService;
