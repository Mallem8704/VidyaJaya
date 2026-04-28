import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  Trophy, 
  BarChart2, 
  HelpCircle, 
  User, 
  Settings,
  LogOut,
  X,
  Sparkles,
  ShieldCheck,
  Lock,
  Wallet as WalletIcon,
  Share2
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  const isPro = user?.is_pro && (!user?.pro_expiry || new Date(user?.pro_expiry) > new Date());

  const navItems = [
    { 
      name: isPro ? 'PRO Dashboard' : 'Dashboard', 
      icon: LayoutDashboard, 
      path: isPro ? '/pro-dashboard' : '/dashboard' 
    },
    { 
      name: isPro ? 'PRO Tests' : 'Tests', 
      icon: isPro ? ShieldCheck : BookOpen, 
      path: isPro ? '/pro-tests' : '/tests' 
    },
    { name: 'AI Questions', icon: Sparkles, path: '/ai-questions' },
    { name: 'Practice', icon: Target, path: '/practice' },
    { 
      name: isPro ? 'PRO Leaderboard' : 'Leaderboard', 
      icon: Trophy, 
      path: isPro ? '/pro-leaderboard' : '/leaderboard' 
    },
    { name: 'Analysis', icon: BarChart2, path: '/analysis' },
    { name: 'Doubts', icon: HelpCircle, path: '/doubts' },
    { name: 'Wallet', icon: WalletIcon, path: '/wallet' },
    { name: 'Refer & Earn', icon: Share2, path: '/refer-and-earn' },
    ...(user?.role === 'admin' || user?.is_admin || user?.email === 'mallem8704@gmail.com' ? [{ name: 'Admin Panel', icon: ShieldCheck, path: '/admin' }] : []),
    { name: 'Pricing', icon: Sparkles, path: '/pricing' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-primary text-white transition-transform duration-300 ease-in-out
        flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo area */}
        <div className="flex items-center justify-between p-4 border-b border-primary-light">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center overflow-hidden shadow-lg border border-secondary/20">
              <img src="/logo.png" alt="V" className="w-full h-full object-contain" />
            </div>
            <span className="font-heading font-bold text-xl tracking-wide">VidyaJaya</span>
          </div>
          <button 
            className="lg:hidden text-gray-300 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/10">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200
                    ${isActive ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'hover:bg-primary-light text-gray-300 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  {item.premium && !isPro && (
                    <Lock size={12} className="text-accent-gold" />
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Upgrade Card */}
          {!user?.is_pro && (
            <div className="mx-4 mt-6 p-4 rounded-xl bg-gradient-to-br from-secondary/40 to-accent-gold/40 border border-secondary/30 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-white/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
              <p className="text-xs font-bold text-accent-gold mb-1 flex items-center gap-1 relative z-10">
                <Sparkles size={12}/> UPGRADE TO PRO
              </p>
              <p className="text-[10px] text-gray-100 mb-3 relative z-10">Unlock unlimited AI doubt solving & cash rewards.</p>
              <NavLink 
                to="/pricing" 
                className="block w-full py-2 text-center text-[10px] font-bold bg-white text-secondary rounded-lg hover:bg-opacity-90 transition-all shadow-sm relative z-10"
              >
                GET PRO NOW
              </NavLink>
            </div>
          )}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-primary-light bg-primary-light bg-opacity-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent-gold flex items-center justify-center text-white font-bold uppercase shadow-md border-2 border-white/10 overflow-hidden">
                {(user?.avatar_url || user?.avatar) ? (
                  <img src={user?.avatar_url || user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold truncate w-24">{user?.name || 'Student'}</span>
                <span className="text-[10px] text-accent-gold font-bold uppercase tracking-wider">
                  {user?.is_pro ? 'PRO MEMBER' : 'Free Plan'}
                </span>
              </div>
            </div>
            <button title="Settings" className="text-gray-300 hover:text-white transition-colors">
              <Settings size={18} />
            </button>
          </div>
          <button 
            onClick={logout}
            className="mt-3 flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 w-full transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav (visible only on small screens) */}
      <nav className="fixed bottom-0 w-full bg-[var(--bg-card)] border-t border-[var(--border)] shadow-[0_-4px_24px_rgba(0,0,0,0.05)] flex justify-around items-center h-16 lg:hidden z-40">
        {navItems.slice(0, 5).map((item) => (
           <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200
                ${isActive ? 'text-secondary' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
              `}
            >
              <item.icon size={22} className="mb-0.5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
