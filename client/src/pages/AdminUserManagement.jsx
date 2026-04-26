import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Users, 
    Search, 
    Filter, 
    UserMinus, 
    UserCheck, 
    Crown, 
    Shield, 
    MoreVertical,
    Loader2,
    Calendar,
    Mail,
    Ban,
    Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ role: '', is_pro: '' });

    useEffect(() => {
        fetchUsers();
    }, [filters]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                ...filters
            };
            const res = await axios.get('/api/admin/users', { params });
            setUsers(res.data);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const toggleBlock = async (id, currentStatus) => {
        const action = currentStatus ? 'unblock' : 'block';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            const res = await axios.post(`/api/admin/users/${id}/toggle-block`);
            toast.success(res.data.message);
            setUsers(users.map(u => u.id === id ? { ...u, is_blocked: res.data.is_blocked } : u));
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
                        <Users className="text-secondary" size={32} /> User Directory
                    </h1>
                    <p className="text-gray-500 mt-1">Manage platform members, monitor roles, and enforce security.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-secondary transition-all"
                        />
                    </form>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border)]">
                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-light)] rounded-xl border border-[var(--border)]">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-xs font-bold uppercase text-gray-400 mr-2">Role</span>
                    <select 
                        value={filters.role}
                        onChange={(e) => setFilters({...filters, role: e.target.value})}
                        className="bg-transparent text-sm font-bold outline-none"
                    >
                        <option value="">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-light)] rounded-xl border border-[var(--border)]">
                    <Crown size={16} className="text-accent-gold" />
                    <span className="text-xs font-bold uppercase text-gray-400 mr-2">Subscription</span>
                    <select 
                        value={filters.is_pro}
                        onChange={(e) => setFilters({...filters, is_pro: e.target.value})}
                        className="bg-transparent text-sm font-bold outline-none"
                    >
                        <option value="">All Tiers</option>
                        <option value="true">PRO Only</option>
                        <option value="false">Free Only</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden border border-[var(--border)] shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-[var(--border)]">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Member</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status & Role</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Wallet</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Joined</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <Loader2 className="w-10 h-10 text-secondary animate-spin mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium font-heading uppercase tracking-widest">Scanning Records...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <p className="text-gray-500 font-bold">No users found matching your criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className={`group hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all ${u.is_blocked ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${u.is_pro ? 'bg-gradient-to-br from-accent-gold to-yellow-600' : 'bg-gradient-to-br from-primary to-primary-light'}`}>
                                                    {u.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                                        {u.name}
                                                        {u.is_pro && <Crown size={14} className="text-accent-gold" />}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Mail size={12} />
                                                        <span>{u.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {u.role}
                                                    </span>
                                                    {u.is_blocked && (
                                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                                                            Suspended
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-mono">{u.id.substring(0, 18)}...</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-heading font-bold text-secondary">₹{u.coins / 10}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{u.coins} Coins</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar size={14} />
                                                <span>{new Date(u.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => toggleBlock(u.id, u.is_blocked)}
                                                    className={`p-2 rounded-xl transition-all ${u.is_blocked ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                                                    title={u.is_blocked ? 'Unblock User' : 'Suspend User'}
                                                >
                                                    {u.is_blocked ? <UserCheck size={20} /> : <Ban size={20} />}
                                                </button>
                                                <button className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">
                                                    <MoreVertical size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUserManagement;
