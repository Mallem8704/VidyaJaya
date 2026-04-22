import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, LogOut, Bell, Shield, CreditCard, ChevronRight, Edit3, User as UserIcon, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const Profile = () => {
  const { user, logout, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Account Details');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    examGoal: user?.examGoal || 'UPSC'
  });

  const tabs = [
    { icon: UserIcon, label: 'Account Details' },
    { icon: Shield, label: 'Password & Security' },
    { icon: Bell, label: 'Notifications' },
    { icon: CreditCard, label: 'Subscription' },
    { icon: Settings, label: 'App Settings' },
  ];

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const res = await axios.put('/api/profiles/update', profileData);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10 space-y-6">
      
      <div className="card p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden bg-primary text-white border-0 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
        
        <div className="relative group cursor-pointer z-10">
          <div className="w-28 h-28 bg-[var(--bg-light)] bg-opacity-20 rounded-full border-4 border-[rgba(255,255,255,0.2)] flex items-center justify-center text-4xl font-bold text-gray-200 overflow-hidden shadow-xl backdrop-blur-md">
             {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white border-2 border-primary shadow-md hover:scale-110 transition-transform">
            <Edit3 size={14} />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
           <h2 className="text-3xl font-heading font-bold mb-1">{user?.name || 'Warrior'}</h2>
           <p className="text-primary-light mb-4">{user?.email}</p>
           <div className="flex flex-wrap gap-2 justify-center md:justify-start">
             <span className="px-3 py-1 bg-[rgba(255,255,255,0.1)] rounded-full text-xs font-bold border border-[rgba(255,255,255,0.2)] backdrop-blur-md">🎯 Goal: {user?.examGoal || 'UPSC'}</span>
             <span className="px-3 py-1 bg-accent-gold text-yellow-900 font-bold rounded-full text-xs shadow-md">👑 Plan: {user?.plan || 'Free'}</span>
             <span className="px-3 py-1 bg-accent-green text-green-900 font-bold rounded-full text-xs shadow-md">Verified Student</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         
         {/* Sidebar menus */}
         <div className="md:col-span-1 space-y-2">
            {tabs.map((menu, i) => {
               const isActive = activeTab === menu.label;
               return (
                 <button 
                   key={i} 
                   onClick={() => setActiveTab(menu.label)}
                   className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${isActive ? 'bg-secondary text-white border-secondary shadow-md scale-[1.02]' : 'bg-[var(--bg-card)] border-[var(--border)] hover:border-secondary hover:text-secondary text-[var(--text-primary)]'}`}
                 >
                   <menu.icon size={20} />
                   <span className="font-bold text-sm">{menu.label}</span>
                   <ChevronRight size={16} className={`ml-auto ${isActive ? 'text-white' : 'text-[var(--text-secondary)]'}`} />
                 </button>
               );
            })}
            
            <button onClick={logout} className="w-full flex items-center gap-3 p-4 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 dark:border-red-900 dark:bg-[rgba(255,0,0,0.05)] dark:text-red-400 transition-colors mt-6 font-bold text-sm">
               <LogOut size={20} /> Log out
            </button>
         </div>

         {/* Dynamic Panel Area */}
         <div className="md:col-span-2 card p-8 space-y-6 flex flex-col mt-0">
            <h3 className="font-heading font-bold text-2xl border-b border-[var(--border)] pb-4 mb-6">{activeTab}</h3>
            
            <motion.div 
               key={activeTab} // Forces re-animation when tab changes
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex-1"
            >
              {activeTab === 'Account Details' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Full Name</label>
                       <input type="text" name="name" value={profileData.name} onChange={handleChange} className="w-full p-3 bg-[var(--bg-light)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] outline-none focus:border-secondary transition-colors" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Email Address</label>
                       <input type="email" disabled value={user?.email} className="w-full p-3 bg-[var(--bg-light)] border border-[var(--border)] rounded-lg text-gray-500 cursor-not-allowed opacity-70" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Phone Number</label>
                       <input type="text" name="phone" value={profileData.phone} onChange={handleChange} className="w-full p-3 bg-[var(--bg-light)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] outline-none focus:border-secondary transition-colors" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Exam Target</label>
                       <select name="examGoal" value={profileData.examGoal} onChange={handleChange} className="w-full p-3 bg-[var(--bg-light)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] outline-none focus:border-secondary transition-colors">
                          <option value="UPSC">UPSC Civil Services</option>
                          <option value="SSC">SSC CGL</option>
                          <option value="Banking">Banking PO</option>
                          <option value="RRB">RRB Railways</option>
                       </select>
                     </div>
                  </div>
                  <div className="pt-8 mt-8 border-t border-[var(--border)] flex justify-end">
                     <button onClick={handleUpdate} disabled={isUpdating} className="btn btn-primary px-8 flex items-center gap-2">
                       {isUpdating && <Loader className="animate-spin" size={16} />}
                       {isUpdating ? 'Saving...' : 'Save Changes'}
                     </button>
                  </div>
                </div>
              )}

              {activeTab === 'Password & Security' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Current Password</label>
                     <input type="password" placeholder="••••••••" className="w-full p-3 bg-[var(--bg-light)] border border-[var(--border)] rounded-lg outline-none focus:border-secondary" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">New Password</label>
                     <input type="password" placeholder="Enter new password" className="w-full p-3 bg-[var(--bg-light)] border border-[var(--border)] rounded-lg outline-none focus:border-secondary" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Confirm New Password</label>
                     <input type="password" placeholder="Confirm new password" className="w-full p-3 bg-[var(--bg-light)] border border-[var(--border)] rounded-lg outline-none focus:border-secondary" />
                  </div>
                  <button className="btn btn-primary px-8 mt-4">Update Password</button>
                </div>
              )}

              {activeTab === 'Notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-light)] rounded-xl border border-[var(--border)]">
                     <div>
                        <div className="font-bold">Daily Streak Reminders</div>
                        <div className="text-sm text-[var(--text-secondary)]">Get notified before you lose your streak.</div>
                     </div>
                     <input type="checkbox" defaultChecked className="w-5 h-5 accent-secondary" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-light)] rounded-xl border border-[var(--border)]">
                     <div>
                        <div className="font-bold">Weekly Performance Report</div>
                        <div className="text-sm text-[var(--text-secondary)]">Receive AI diagnostics via email.</div>
                     </div>
                     <input type="checkbox" defaultChecked className="w-5 h-5 accent-secondary" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-light)] rounded-xl border border-[var(--border)]">
                     <div>
                        <div className="font-bold">Leaderboard Alerts</div>
                        <div className="text-sm text-[var(--text-secondary)]">Notify me when someone beats my rank.</div>
                     </div>
                     <input type="checkbox" className="w-5 h-5 accent-secondary" />
                  </div>
                </div>
              )}

              {activeTab === 'Subscription' && (
                <div className="text-center space-y-6 pt-4">
                  <div className="w-20 h-20 bg-accent-gold bg-opacity-20 rounded-full flex items-center justify-center text-4xl mx-auto border-4 border-yellow-200">
                    👑
                  </div>
                  <h4 className="font-bold text-2xl">You are a PRO Member</h4>
                  <p className="text-[var(--text-secondary)] px-10">Your current plan gives you unlimited access to AI Doubts, Sectional Mocks, and Ad-Free studying.</p>
                  <div className="p-4 bg-[var(--bg-light)] border border-[var(--border)] rounded-lg inline-block w-full max-w-sm">
                    <div className="text-sm text-[var(--text-secondary)] mb-1">Next Billing Date</div>
                    <div className="font-bold font-heading text-lg">April 24, 2026</div>
                  </div>
                  <div className="flex gap-4 justify-center mt-6">
                     <button className="btn btn-outline text-red-500 border-red-200 hover:bg-red-50">Cancel Plan</button>
                     <button className="btn btn-primary">Upgrade to Yearly</button>
                  </div>
                </div>
              )}

              {activeTab === 'App Settings' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Language</label>
                     <select className="w-full p-3 bg-[var(--bg-light)] border border-[var(--border)] rounded-lg outline-none focus:border-secondary">
                        <option>English</option>
                        <option>Hindi (Beta)</option>
                     </select>
                  </div>
                  <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                     <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide block">Data Management</label>
                     <button className="btn btn-outline w-full text-left justify-start">Export My Data (JSON)</button>
                     <button className="btn btn-outline border-red-200 text-red-500 w-full text-left justify-start hover:bg-red-50">Delete Account Permanently</button>
                  </div>
                </div>
              )}

            </motion.div>
         </div>
         
      </div>

    </div>
  );
};

export default Profile;
