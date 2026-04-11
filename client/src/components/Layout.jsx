import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { Menu, Bell, Sun, Moon } from 'lucide-react';

const Layout = () => {
  const { theme, toggleTheme, toggleSidebar } = useAppStore();
  const { user } = useAuthStore();

  // Apply theme class on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex h-screen bg-[var(--bg-light)] overflow-hidden text-[var(--text-primary)] transition-colors duration-300">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 relative w-full pb-16 lg:pb-0 h-full overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 px-4 md:px-8 border-b border-[var(--border)] bg-[var(--bg-card)] bg-opacity-80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-[var(--text-secondary)] hover:text-primary transition-colors focus:outline-none"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-xl font-heading font-bold animate-fade-in">
                Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">{dateStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-[var(--bg-light)] text-[var(--text-secondary)] hover:text-secondary transition-all"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button className="relative p-2 rounded-full hover:bg-[var(--bg-light)] text-[var(--text-secondary)] hover:text-secondary transition-all">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--bg-card)]"></span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
