import React, { useState, useEffect } from 'react';
import { Timer, Zap, ShieldAlert, Award } from 'lucide-react';

const ContestCountdown = () => {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState('active'); // 'pending', 'active', 'ended'

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      
      let target;
      if (hour < 9) {
        setStatus('pending');
        target = new Date();
        target.setHours(9, 0, 0, 0);
      } else if (hour < 21) {
        setStatus('active');
        target = new Date();
        target.setHours(21, 0, 0, 0);
      } else {
        setStatus('ended');
        target = new Date();
        target.setHours(9, 0, 0, 0);
        target.setDate(target.getDate() + 1);
      }

      const diff = target - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`p-6 rounded-[2rem] border-2 transition-all duration-500 shadow-2xl ${
      status === 'active' 
        ? 'bg-orange-500 border-orange-400 text-white shadow-orange-500/30' 
        : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-primary)]'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'active' ? 'bg-white/20' : 'bg-orange-500 text-white'}`}>
            {status === 'active' ? <Zap size={20} /> : <Timer size={20} />}
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tighter">
              {status === 'active' ? 'Contest is Live' : status === 'pending' ? 'Coming Up Next' : 'Contest Ended'}
            </h3>
            <p className={`text-[10px] font-bold uppercase opacity-70`}>
              {status === 'active' ? 'Ends at 09:00 PM IST' : 'Starts at 09:00 AM IST'}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs font-black opacity-50 uppercase">Time Left</div>
          <div className="text-3xl font-black font-heading tabular-nums">{timeLeft}</div>
        </div>
      </div>

      {status === 'active' && (
        <div className="bg-white/10 p-3 rounded-2xl flex items-center gap-3 text-xs font-bold border border-white/10 animate-pulse">
          <ShieldAlert size={16} />
          High prize pool today! Beat the Top 10 to win rewards.
        </div>
      )}

      {status === 'ended' && (
        <div className="bg-red-500/10 p-3 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-500/20 text-red-500">
          <Award size={16} />
          Contest ended. Leaderboard is now locked.
        </div>
      )}
    </div>
  );
};

export default ContestCountdown;
