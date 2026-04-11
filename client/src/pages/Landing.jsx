import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Award, Trophy, Users, FileText, CheckCircle, Play, Star } from 'lucide-react';

// Custom Hook for Scroll
const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  useEffect(() => {
    const updatePosition = () => setScrollPosition(window.pageYOffset);
    window.addEventListener('scroll', updatePosition);
    return () => window.removeEventListener('scroll', updatePosition);
  }, []);
  return scrollPosition;
};

// Typewriter Component
const TypewriterText = () => {
  const words = ["Crack UPSC 2026", "Score 99 in SSC CGL", "Ace RRB NTPC", "Beat 2.5 Lakh Students"];
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !isDeleting) {
      setTimeout(() => setIsDeleting(true), 1500);
      return;
    }
    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, Math.max(isDeleting ? 50 : 100, parseInt(Math.random() * 150)));

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting, words]);

  return (
    <span className="text-2xl md:text-3xl font-medium text-[var(--text-secondary)] mt-4 block h-10">
      {words[index].substring(0, subIndex)}
      <span className="animate-pulse border-r-2 border-[var(--text-secondary)] ml-1"></span>
    </span>
  );
};

// Counter Component
const AnimatedCounter = ({ end, duration = 2000, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  // Format with commas if over 1000
  const formattedCount = count > 999 ? count.toLocaleString('en-IN') : count;
  return <span className="font-heading font-black text-3xl">{prefix}{formattedCount}{suffix}</span>;
};

const Landing = () => {
  const scrollPos = useScrollPosition();
  const isScrolled = scrollPos > 50;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFF]">
      
      {/* Background Decorators */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #0A2540 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.06
        }}
      ></div>
      <div className="absolute -top-40 -right-20 w-[400px] h-[400px] rounded-full bg-[rgba(255,107,0,0.08)] blur-3xl pointer-events-none z-0"></div>
      <div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] rounded-full bg-[rgba(10,37,64,0.06)] blur-3xl pointer-events-none z-0"></div>

      {/* Navbar */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/85 backdrop-blur-md border-b border-gray-200 shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center font-bold text-white text-2xl shadow-lg">V</div>
            <span className="font-heading font-black text-2xl text-primary tracking-tight">VidyaJaya</span>
            <span className="ml-2 hidden md:flex items-center gap-1 text-[10px] font-bold bg-[#FFF4ED] text-orange-700 px-2 py-1 rounded-full border border-orange-200">
              <Star size={10} className="fill-orange-500 text-orange-500" /> #1 UPSC Platform
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="font-bold text-primary hover:underline underline-offset-4 decoration-2 transition-all">Log in</Link>
            <Link to="/signup" className="bg-secondary text-white font-bold px-5 py-2.5 rounded-lg hover:scale-105 hover:bg-[#E56000] transition-transform shadow-md">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 lg:px-12 pt-36 md:pt-44 pb-20 relative z-10 flex flex-col md:flex-row items-center">
        
        {/* Left Side Content */}
        <div className="w-full md:w-[55%] flex flex-col justify-center text-center md:text-left">
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0, duration: 0.7 }}>
            <h1 className="text-[48px] md:text-[72px] font-heading font-black text-primary leading-[1.1] mb-2 tracking-tight">
              Study Smarter.
            </h1>
            <h1 className="text-[48px] md:text-[72px] font-heading font-black leading-[1.1] mb-4 tracking-tight">
              <span className="relative inline-block text-primary">
                Rank Higher.
                <svg className="absolute w-full h-[18px] md:h-[24px] -bottom-2 md:-bottom-4 left-0 text-secondary opacity-90" viewBox="0 0 300 24" preserveAspectRatio="none">
                  <path d="M2.083 18.062c35.636-6.142 121.2-13.414 294.61-4.733-52.023-4.5-121.841-8.598-175.76-8.243-74.966.494-118.826 3.16-120.932 3.32-7.585.578 37.892.42 66.868.42" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"></path>
                </svg>
              </span>
            </h1>
            <TypewriterText />
          </motion.div>

          {/* Subtext Pill Badges */}
          <motion.div 
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.6 } } }}
            className="flex flex-wrap justify-center md:justify-start gap-3 mt-10 mb-12"
          >
            {[
              { icon: <Flame size={16} className="text-secondary"/>, text: "Daily AI Mock Tests" },
              { icon: <Award size={16} className="text-secondary"/>, text: "Earn Real Rewards" },
              { icon: <Trophy size={16} className="text-secondary"/>, text: "Live Leaderboard" }
            ].map((pill, i) => (
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} key={i} className="flex items-center gap-2 bg-[#FFF4ED] text-primary font-bold text-sm px-4 py-2 rounded-full border border-orange-100">
                {pill.icon} {pill.text}
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-6">
            <Link to="/signup" className="w-full sm:w-auto bg-[#FF6B00] text-white font-bold text-[18px] px-[36px] py-[18px] rounded-[14px] shadow-[0_0_0_rgba(255,107,0,0)] animate-[pulse-glow_2s_infinite] flex items-center justify-center gap-2 group transition-all hover:bg-[#E56000]">
              Start for Free — No Card Needed
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            
            <button className="w-full sm:w-auto group border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold text-[16px] px-[24px] py-[16px] rounded-[14px] flex items-center justify-center gap-2 transition-colors">
              <Play size={18} className="fill-[transparent] group-hover:fill-white text-primary group-hover:text-white transition-colors" /> Watch How It Works
            </button>
          </motion.div>
          
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-sm text-gray-500 font-medium text-center md:text-left flex items-center justify-center md:justify-start gap-1">
             <span className="text-yellow-400">⭐⭐⭐⭐⭐</span> Trusted by 2.5L+ students across India — Join Free Today
          </motion.p>
          
          {/* Trust Bar Custom CSS */}
          <style>{`
            @keyframes pulse-glow {
              0% { box-shadow: 0 0 0 0 rgba(255,107,0, 0.4); }
              70% { box-shadow: 0 0 0 15px rgba(255,107,0, 0); }
              100% { box-shadow: 0 0 0 0 rgba(255,107,0, 0); }
            }
            .floating-card { animation: float-card 3s infinite ease-in-out; }
            @keyframes float-card {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-12px); }
            }
          `}</style>
          
          {/* Trust Bar Counters */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-16 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-2 md:flex items-center gap-y-6 md:gap-y-0 justify-between">
              
              <div className="flex flex-col">
                <AnimatedCounter end={250000} suffix="+" />
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider flex items-center gap-1 mt-1"><Users size={14}/> Students</span>
              </div>
              <div className="hidden md:block w-px h-12 bg-gray-200"></div>
              
              <div className="flex flex-col">
                <AnimatedCounter end={50000} suffix="+" />
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider flex items-center gap-1 mt-1"><FileText size={14}/> Tests Daily</span>
              </div>
              <div className="hidden md:block w-px h-12 bg-gray-200"></div>
              
              <div className="flex flex-col">
                <AnimatedCounter end={94} suffix="%" />
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider flex items-center gap-1 mt-1"><CheckCircle size={14}/> Success Rate</span>
              </div>
              <div className="hidden md:block w-px h-12 bg-gray-200"></div>
              
              <div className="flex flex-col">
                <span className="font-heading font-black text-3xl">₹0</span>
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider flex items-center gap-1 mt-1">To Start</span>
              </div>

            </div>
          </motion.div>

        </div>

        {/* Right Side Responsive Mockup */}
        <div className="hidden md:block w-[45%] relative pl-12">
           <motion.div 
             initial={{ x: 60, opacity: 0 }} 
             animate={{ x: 0, opacity: 1 }} 
             transition={{ delay: 0.5, type: 'spring', stiffness: 50 }}
             className="relative z-10 floating-card"
           >
             
             {/* Center Shadow Glow */}
             <div className="absolute inset-0 bg-blue-400 blur-[80px] opacity-10 rounded-full scale-150 -z-10"></div>
             
             {/* Main Dashboard Card */}
             <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(10,37,64,0.08)] border border-gray-100 p-8 transform -rotate-[3deg] hover:rotate-0 transition-transform duration-500 w-full relative">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-primary font-bold flex items-center justify-center border-2 border-white shadow">R</div>
                      <div>
                         <h4 className="font-bold text-gray-800 text-lg leading-none">Welcome back, Rahul <span className="text-xl">👋</span></h4>
                         <span className="text-xs text-gray-400">Target: UPSC Civil Services</span>
                      </div>
                   </div>
                   <div className="bg-[#FFF4ED] border border-orange-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                      <Flame size={14} className="text-secondary fill-secondary" />
                      <span className="text-orange-700 font-bold text-sm">12 Day Streak!</span>
                   </div>
                </div>

                {/* Body Metrics */}
                <div className="space-y-6">
                   <div>
                     <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-gray-700 text-sm">Today's Score: General Studies</span>
                        <span className="font-heading font-black text-2xl text-secondary">87%</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-3">
                        <motion.div initial={{ width: 0 }} animate={{ width: '87%' }} transition={{ delay: 1, duration: 1.5 }} className="bg-gradient-to-r from-orange-400 to-secondary h-3 rounded-full shadow-[0_0_10px_rgba(255,107,0,0.4)]"></motion.div>
                     </div>
                   </div>

                   <div className="bg-[#F8FAFF] p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-center mb-3">
                         <span className="font-bold text-gray-800 flex items-center gap-1.5"><Trophy size={16} className="text-yellow-500"/> Global Rank</span>
                         <span className="font-heading font-bold text-primary">#342 of 45,230</span>
                      </div>
                      
                      <div className="space-y-2 mt-4 text-sm">
                         <div className="flex justify-between items-center p-2 rounded hover:bg-white transition-colors">
                            <span className="font-bold text-gray-500">1. Kiran R.</span>
                            <span className="font-bold">2450</span>
                         </div>
                         <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm border border-gray-100 border-l-2 border-l-secondary">
                            <span className="font-bold text-primary">342. Rahul (You)</span>
                            <span className="font-bold text-secondary">1920</span>
                         </div>
                         <div className="flex justify-between items-center p-2 rounded hover:bg-white transition-colors">
                            <span className="font-bold text-gray-500">343. Sneha P.</span>
                            <span className="font-bold">1910</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Floating Badge 1 (Coins) */}
             <motion.div 
               initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}
               className="absolute -right-6 top-12 bg-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-gray-100 z-20 pointer-events-none"
             >
                <div className="bg-yellow-100 p-2 rounded-full"><Award size={16} className="text-yellow-600"/></div>
                <span className="font-bold text-sm whitespace-nowrap">💰 +25 Coins Earned!</span>
             </motion.div>

             {/* Floating Badge 2 (Badge) */}
             <motion.div 
               initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5, type: 'spring' }}
               className="absolute -left-12 -bottom-6 bg-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-gray-100 z-20 pointer-events-none"
             >
                <div className="bg-green-100 p-2 rounded-full"><CheckCircle size={16} className="text-green-600"/></div>
                <span className="font-bold text-sm whitespace-nowrap">🏆 New Badge Unlocked!</span>
             </motion.div>

           </motion.div>
        </div>
      </main>
      
    </div>
  );
};

export default Landing;
