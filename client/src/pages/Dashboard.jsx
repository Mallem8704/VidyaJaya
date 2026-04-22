import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle, Target, HelpCircle, Trophy, TrendingUp, Calendar as CalendarIcon, Snowflake } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const mockPerformanceData = [
  { date: '1 Apr', score: 65 },
  { date: '3 Apr', score: 70 },
  { date: '5 Apr', score: 68 },
  { date: '7 Apr', score: 74 },
  { date: '9 Apr', score: 82 },
  { date: '10 Apr', score: 78 },
  { date: '11 Apr', score: 87 },
];

const mockTests = [
  { id: 1, name: 'UPSC Prelims GS Set #47', category: 'UPSC', score: '87%', accuracy: '92%', date: 'Today' },
  { id: 2, name: 'SSC CGL Reasoning #23', category: 'SSC', score: '94%', accuracy: '96%', date: 'Yesterday' },
  { id: 3, name: 'Current Affairs April', category: 'UPSC', score: '78%', accuracy: '80%', date: '2 days ago' },
];

const Dashboard = () => {
  const { user, updateUser } = useAuthStore();
  const [isFreezing, setIsFreezing] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loadingStage, setLoadingStage] = useState('spinner'); // 'spinner', 'waking', 'error', 'loaded'

  React.useEffect(() => {
    const wakeTimer = setTimeout(() => {
      setLoadingStage(prev => prev === 'spinner' ? 'waking' : prev);
    }, 3000);

    const errorTimer = setTimeout(() => {
      setLoadingStage(prev => prev === 'waking' ? 'error' : prev);
    }, 8000);

    axios.get('/api/dashboard')
      .then(res => {
         setDashboard(res.data);
         setLoadingStage('loaded');
         clearTimeout(wakeTimer);
         clearTimeout(errorTimer);
      })
      .catch(err => {
         console.error("Failed to load dashboard:", err);
         setLoadingStage('error');
         clearTimeout(wakeTimer);
         clearTimeout(errorTimer);
      });

    return () => {
      clearTimeout(wakeTimer);
      clearTimeout(errorTimer);
    };
  }, []);

  if (loadingStage === 'spinner' || loadingStage === 'waking') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-white rounded-full animate-spin"></div>
        <p className="text-secondary font-bold font-heading animate-pulse">
          {loadingStage === 'waking' ? 'Server waking up, please wait...' : 'Loading Your Insights...'}
        </p>
      </div>
    );
  }

  if (loadingStage === 'error' || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl">⚠️</div>
        <h2 className="text-xl font-bold">Failed to load statistics</h2>
        <p className="text-gray-400 max-w-sm">We couldn't connect to the analytics server. Please refresh or try again later.</p>
        <button onClick={() => window.location.reload()} className="btn bg-primary text-white mt-4">Retry Connection</button>
      </div>
    );
  }

  const streakAmount = dashboard.streak;
  const coinsAmount = dashboard.coins;
  const rankAmount = dashboard.rank;
  const freezeCount = user?.streak?.freezesRemaining || 0;

  const handleFreeze = () => {
    if (coinsAmount < 50) {
      toast.error("Not enough coins! You need 50 💰");
      return;
    }
    setIsFreezing(true);
    setTimeout(() => {
      // Mock freeze API success
      updateUser({ 
        coins: coinsAmount - 50,
        streak: { ...user.streak, freezesRemaining: freezeCount + 1 }
      });
      toast.success("Streak freeze activated!");
      setIsFreezing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* STREAK HERO CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-2xl bg-primary text-white p-6 sm:p-8 relative overflow-hidden shadow-custom"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 bg-[rgba(255,107,0,0.2)] rounded-full flex items-center justify-center text-5xl shrink-0"
            >
              🔥
            </motion.div>
            <div>
              <h2 className="text-3xl font-heading font-bold mb-1">{streakAmount} Day Streak!</h2>
              <p className="text-primary-light text-sm mb-4 bg-primary px-3 py-1 bg-opacity-50 inline-block rounded-full border border-[rgba(255,255,255,0.1)] text-white">
                Keep going! 3 more days to unlock the Gold badge
              </p>
              
              <div className="flex items-center gap-3">
                <div className="h-2 w-48 bg-primary-light rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '80%' }}></div>
                </div>
                <span className="text-xs font-semibold text-accent-gold">💰 {coinsAmount} coins</span>
              </div>
              <p className="text-[10px] text-white opacity-40 mt-3 flex items-center gap-1">
                <CalendarIcon size={10} /> Updated just now: {new Date(dashboard.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3 md:items-end">
            <div className="flex gap-1 mb-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-bold
                  ${i < 4 ? 'bg-accent-green text-white' : i === 4 ? 'bg-secondary text-white ring-2 ring-white' : 'bg-primary-light text-gray-400'}`}>
                  {i === 4 ? 'T' : '✓'}
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleFreeze}
              disabled={isFreezing}
              className="flex items-center gap-2 btn bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] border border-[rgba(255,255,255,0.2)] text-white text-sm"
            >
              {isFreezing ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div> : <Snowflake size={16} className="text-blue-300" />}
              {freezeCount > 0 ? `Freezes: ${freezeCount}` : 'Freeze Streak (50 💰)'}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tasks & Quick Start */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Performance Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Accuracy', value: `${dashboard.accuracy}%`, icon: Target, color: 'text-secondary', change: 'Computed from all tests' },
              { label: 'Tests Taken', value: dashboard.testsTaken, icon: CheckCircle, color: 'text-accent-green', change: 'Total submissions' },
              { label: 'Global Rank', value: `#${dashboard.rank}`, icon: Trophy, color: 'text-accent-gold', change: 'Live ranking' },
              { label: 'Performance', value: dashboard.performance, icon: TrendingUp, color: 'text-accent-purple', change: dashboard.improvementMessage },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm font-medium">
                  <stat.icon size={16} className={stat.color} />
                  {stat.label}
                </div>
                <div className="text-2xl font-bold font-heading">{stat.value}</div>
                <div className="text-[10px] text-[var(--text-secondary)]">{stat.change}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today's Tasks */}
            <div className="card p-5">
              <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                <CalendarIcon size={18} className="text-secondary" /> Today's Tasks
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-accent-green shrink-0 mt-0.5" />
                  <span className="text-sm text-[var(--text-secondary)] line-through">Take Daily Current Affairs Quiz</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded border-2 border-secondary shrink-0 mt-0.5"></div>
                  <span className="text-sm font-medium">Complete UPSC Polity Practice Set</span>
                </li>
                <li className="flex items-start gap-3 opacity-60">
                  <div className="w-5 h-5 rounded border-2 border-[var(--border)] shrink-0 mt-0.5"></div>
                  <span className="text-sm">Review Yesterday's Mistakes</span>
                </li>
                <li className="flex items-start gap-3 opacity-50 relative group">
                  <LockIcon className="w-5 h-5 text-[var(--text-secondary)] shrink-0 mt-0.5" />
                  <span className="text-sm line-through">Attempt Weekly Mock Test</span>
                  <div className="absolute right-0 top-0 text-[10px] bg-accent-gold text-white px-2 py-0.5 rounded shadow">PRO</div>
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Link to="/test/mock-47" className="group block bg-gradient-to-r from-primary to-primary-light p-4 rounded-xl text-white shadow hover:shadow-lg transition-transform hover:-translate-y-1">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold mb-1 group-hover:text-secondary transition-colors">📝 Today's Mock Test</h4>
                    <p className="text-xs text-gray-300">UPSC Prelims Set #47 • 120m</p>
                  </div>
                  <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              
              <Link to="/practice" className="group block bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl shadow hover:border-secondary transition-all hover:-translate-y-1">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold mb-1 text-[var(--text-primary)] flex items-center gap-2">
                       ✨ AI Practice
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">
                       {dashboard.recommendation || "Take tests to unlock AI insights!"}
                    </p>
                  </div>
                  <ArrowRightIcon className="text-secondary group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link to="/doubts" className="group block bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl shadow hover:border-accent-purple transition-all hover:-translate-y-1">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold mb-1 text-[var(--text-primary)]">❓ Doubt Solver</h4>
                    <p className="text-xs text-[var(--text-secondary)]">Upload any question image</p>
                  </div>
                  <ArrowRightIcon className="text-accent-purple group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-bold text-lg">Your Score Trend</h3>
              <select className="bg-[var(--bg-light)] border border-[var(--border)] text-sm rounded-lg px-3 py-1 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow)', backgroundColor: 'var(--bg-card)' }}
                    itemStyle={{ color: '#FF6B00', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Leaderboard Mini */}
          <div className="card p-5">
            <h3 className="font-heading font-bold text-lg mb-4 flex items-center justify-between">
              🏅 Top Warriors
              <Link to="/leaderboard" className="text-xs text-secondary font-medium hover:underline flex items-center">View Full</Link>
            </h3>
            
            <div className="space-y-3 mb-4">
              {[
                { rank: 1, name: "Kiran R.", score: 2450, icon: "👑" },
                { rank: 2, name: "Sneha P.", score: 2310, icon: "🥈" },
                { rank: 3, name: "Rahul M.", score: 2100, icon: "🥉" },
                { rank: 4, name: "Priya S.", score: 1950, icon: "🏅" },
              ].map((lb) => (
                <div key={lb.rank} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-light)] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg w-6 text-center">{lb.icon}</span>
                    <span className="font-medium text-sm">{lb.name}</span>
                  </div>
                  <span className="text-sm font-bold">{lb.score}</span>
                </div>
              ))}
            </div>
            
            <div className="p-3 bg-[var(--bg-light)] rounded-xl border border-[var(--border)] mt-4">
              <p className="text-xs text-center">
                You are <span className="font-bold text-secondary">#{rankAmount}</span> — 45 pts behind #341
              </p>
            </div>
          </div>

          {/* Recent Tests */}
          <div className="card p-5">
             <h3 className="font-heading font-bold text-lg mb-4">Recent Tests</h3>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead>
                   <tr className="text-[var(--text-secondary)] border-b border-[var(--border)]">
                     <th className="pb-2 font-medium">Test</th>
                     <th className="pb-2 font-medium">Score</th>
                   </tr>
                 </thead>
                 <tbody>
                   {mockTests.map((t) => (
                      <tr key={t.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-light)] transition-colors group cursor-pointer">
                        <td className="py-3">
                          <div className="font-medium text-[var(--text-primary)] group-hover:text-secondary transition-colors truncate w-32 md:w-auto">{t.name}</div>
                          <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{t.date}</div>
                        </td>
                        <td className="py-3 text-right">
                          <span className="font-bold text-accent-green">{t.score}</span>
                        </td>
                      </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Temp simple icons for the dashboard
const LockIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const ArrowRightIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;

export default Dashboard;
