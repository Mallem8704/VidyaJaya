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
  Gift, 
  User, 
  Settings,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Tests', icon: BookOpen, path: '/tests' },
    { name: 'Practice', icon: Target, path: '/practice' },
    { name: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { name: 'Analysis', icon: BarChart2, path: '/analysis' },
    { name: 'Doubts', icon: HelpCircle, path: '/doubts' },
    { name: 'Rewards', icon: Gift, path: '/rewards' },
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
            <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center font-bold text-white text-xl shadow-lg">V</div>
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
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200
                    ${isActive ? 'bg-secondary text-white' : 'hover:bg-primary-light text-gray-300 hover:text-white'}
                  `}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-primary-light bg-primary-light bg-opacity-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent-gold flex items-center justify-center text-white font-bold uppercase shadow-md">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold truncate w-24">{user?.name || 'Student'}</span>
                <span className="text-xs text-accent-gold capitalize">{user?.plan || 'Free'} Plan</span>
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
