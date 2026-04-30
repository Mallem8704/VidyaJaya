import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, LogOut, Bell, Shield, CreditCard, ChevronRight, Edit3, User as UserIcon, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Account Details');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    examGoal: user?.exam_goal || 'UPSC'
  });

  // BUG 11 FIX: Password change state
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Avatar System State
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  
  const defaultAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Caspian',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Daisy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Enzo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=George',
  ];

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('File size must be less than 2MB');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploading(true);
    const loadToast = toast.loading('Uploading your new look...');

    try {
      const res = await axios.put('/api/profiles/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser({ ...user, avatar_url: res.data.avatar_url, avatar: res.data.avatar_url });
      toast.success('Profile picture updated!');
      setIsEditingAvatar(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      toast.dismiss(loadToast);
    }
  };

  const handleSelectAvatar = async (url) => {
    try {
      const res = await axios.put('/api/profiles/select-avatar', { avatarUrl: url });
      updateUser({ ...user, avatar_url: res.data.avatar_url, avatar: res.data.avatar_url });
      toast.success('Avatar updated!');
      setIsEditingAvatar(false);
    } catch (err) {
      toast.error('Failed to select avatar');
    }
  };

  const userAvatar = user?.avatar_url || user?.avatar;

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

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword) {
      return toast.error('Please enter a new password');
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsChangingPassword(true);
    try {
      await axios.put('/api/auth/change-password', {
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully!');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const isPremium = user?.is_pro || user?.plan === 'premium';

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10 space-y-6">
      
      <div className="card p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden bg-primary text-white border-0 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
        
        <div className="relative group z-10">
          <div className="w-28 h-28 bg-[var(--bg-light)] bg-opacity-20 rounded-full border-4 border-[rgba(255,255,255,0.2)] flex items-center justify-center text-4xl font-bold text-gray-200 overflow-hidden shadow-xl backdrop-blur-md relative">
             {userAvatar ? (
               <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
               user?.name?.charAt(0)?.toUpperCase() || 'U'
             )}
             {isUploading && (
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                 <Loader className="animate-spin text-white" size={24} />
               </div>
             )}
          </div>
          <button 
            onClick={() => setIsEditingAvatar(!isEditingAvatar)}
            className="absolute bottom-0 right-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white border-2 border-primary shadow-md hover:scale-110 transition-transform"
          >
            <Edit3 size={14} />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
           <h2 className="text-3xl font-heading font-bold mb-1">{user?.name || 'Warrior'}</h2>
           <p className="text-primary-light mb-4">{user?.email}</p>
           
           <div className="flex flex-wrap gap-2 justify-center md:justify-start">
             <span className="px-3 py-1 bg-[rgba(255,255,255,0.1)] rounded-full text-xs font-bold border border-[rgba(255,255,255,0.2)] backdrop-blur-md">🎯 Goal: {user?.exam_goal || 'UPSC'}</span>
             <span className={`px-3 py-1 font-bold rounded-full text-xs shadow-md ${user?.is_pro ? 'bg-accent-gold text-yellow-900' : 'bg-gray-200 text-gray-700'}`}>
               {user?.is_pro ? '👑 Plan: PRO' : '🎓 Plan: Free'}
             </span>
             <span className={`px-3 py-1 font-bold rounded-full text-xs shadow-md ${user?.is_verified ? 'bg-accent-green text-green-900' : 'bg-gray-300 text-gray-700'}`}>
               {user?.is_verified ? '✓ Verified Student' : '⚠ Unverified'}
             </span>
           </div>
        </div>
      </div>

      {/* Avatar Selection Modal/Panel */}
      {isEditingAvatar && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 border-2 border-secondary/30 bg-[var(--bg-card)] shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Personalize Your Profile</h3>
            <button onClick={() => setIsEditingAvatar(false)} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-4">
              <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Upload Custom Image</p>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--border)] rounded-2xl cursor-pointer hover:bg-secondary/5 hover:border-secondary transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Shield size={24} className="text-secondary mb-2" />
                  <p className="text-xs text-gray-500 font-bold">CLICK TO UPLOAD</p>
                  <p className="text-[10px] text-gray-400">PNG, JPG (MAX 2MB)</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
            </div>

            {/* Default Avatars Section */}
            <div className="space-y-4">
              <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Choose an Avatar</p>
              <div className="grid grid-cols-4 gap-3">
                {defaultAvatars.map((url, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSelectAvatar(url)}
                    className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent hover:border-secondary hover:scale-110 transition-all shadow-sm"
                  >
                    <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

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
               key={activeTab}
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

              {/* BUG 11 FIX: Password change now has real handler */}
              {activeTab === 'Password & Security' && (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-[rgba(59,130,246,0.1)] rounded-xl border border-blue-100 dark:border-blue-900 text-sm text-blue-700 dark:text-blue-300">
                    💡 Leave fields blank if you want to keep your current password.
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">New Password</label>
                     <input 
                       type="password" 
                       placeholder="Enter new password (min 6 chars)"
                       value={passwordData.newPassword}
                       onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                       className="w-full p-3 bg-[var(--bg-light)] border border-[var(--border)] rounded-lg outline-none focus:border-secondary" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Confirm New Password</label>
                     <input 
                       type="password" 
                       placeholder="Confirm new password"
                       value={passwordData.confirmPassword}
                       onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                       className="w-full p-3 bg-[var(--bg-light)] border border-[var(--border)] rounded-lg outline-none focus:border-secondary" 
                     />
                  </div>
                  <button 
                    onClick={handlePasswordChange} 
                    disabled={isChangingPassword}
                    className="btn btn-primary px-8 mt-4 flex items-center gap-2"
                  >
                    {isChangingPassword && <Loader className="animate-spin" size={16} />}
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </button>
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

              {/* BUG 12 FIX: Subscription tab shows real plan */}
              {activeTab === 'Subscription' && (
                <div className="text-center space-y-6 pt-4">
                  {isPremium ? (
                    <>
                      <div className="w-20 h-20 bg-accent-gold bg-opacity-20 rounded-full flex items-center justify-center text-4xl mx-auto border-4 border-yellow-200">
                        👑
                      </div>
                      <h4 className="font-bold text-2xl">You are a PRO Member!</h4>
                      <p className="text-[var(--text-secondary)] px-10">Your current plan gives you unlimited access to AI Doubts, Sectional Mocks, and Ad-Free studying.</p>
                      <div className="flex gap-4 justify-center mt-6">
                         <button className="btn btn-outline text-red-500 border-red-200 hover:bg-red-50">Cancel Plan</button>
                         <button className="btn btn-primary">Upgrade to Yearly</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-4xl mx-auto border-4 border-gray-200 dark:border-gray-700">
                        🎓
                      </div>
                      <h4 className="font-bold text-2xl">You're on the Free Plan</h4>
                      <p className="text-[var(--text-secondary)] px-6">Upgrade to PRO to unlock unlimited tests, AI doubt solving, and priority rankings.</p>
                      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mt-6">
                        <Link to="/pricing" className="btn btn-outline border-2 flex flex-col items-center p-4 h-auto">
                           <span className="text-xl font-bold mb-1">₹69</span>
                           <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Weekly</span>
                        </Link>
                        <Link to="/pricing" className="btn btn-primary flex flex-col items-center p-4 h-auto relative">
                           <span className="absolute -top-3 bg-accent-gold text-white text-[10px] px-2 py-0.5 rounded shadow">Best Value</span>
                           <span className="text-xl font-bold mb-1">₹199</span>
                           <span className="text-xs font-bold uppercase">Monthly</span>
                        </Link>
                      </div>
                    </>
                  )}
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
