import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    CreditCard, 
    History, 
    ShieldCheck, 
    LogOut,
    ChevronLeft,
    TrendingUp,
    AlertTriangle,
    Share2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const AdminLayout = () => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { name: 'Overview', icon: LayoutDashboard, path: '/admin' },
        { name: 'User Management', icon: Users, path: '/admin/users' },
        { name: 'Withdrawals', icon: CreditCard, path: '/admin/withdrawals' },
        { name: 'Referrals', icon: Share2, path: '/admin/referrals' },
        { name: 'Audit Logs', icon: History, path: '/admin/logs' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full z-50">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/20">
                            <ShieldCheck size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="font-heading font-bold text-lg tracking-tight">VidyaJaya</p>
                            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Admin Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) => 
                                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                                    isActive 
                                    ? 'bg-secondary text-white shadow-lg shadow-secondary/20' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            <item.icon size={20} />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-4">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <ChevronLeft size={20} />
                        Back to Site
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8">
                {/* Global Admin Alerts (Placeholder) */}
                <div className="mb-8 flex gap-4 overflow-x-auto pb-2">
                    <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-4 py-2 rounded-xl border border-yellow-200 dark:border-yellow-900/50 text-xs font-bold whitespace-nowrap">
                        <AlertTriangle size={14} />
                        <span>System Check: 3 Pending Security Reviews</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl border border-green-200 dark:border-green-900/50 text-xs font-bold whitespace-nowrap">
                        <TrendingUp size={14} />
                        <span>Daily Engagement up 12%</span>
                    </div>
                </div>

                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
