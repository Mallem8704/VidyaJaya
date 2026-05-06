import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  Copy, 
  Check, 
  ExternalLink,
  DollarSign,
  AlertCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const InfluencerDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentReferrals, setRecentReferrals] = useState([]);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifsc: '',
    accountHolder: '',
    upiId: ''
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/api/influencer/stats');
      setStats(data.stats);
      setRecentReferrals(data.recentReferrals);
      setReferralCode(data.referralCode);
    } catch (err) {
      console.error('[INFLUENCER_FETCH_ERR]', err);
      const msg = err.response?.data?.message || 'Failed to connect to influencer services';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!referralCode) return;
    const link = `https://vidyajaya.in/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!stats) return;
    if (Number(withdrawAmount) < 500) {
      return toast.error('Minimum withdrawal is ₹500');
    }
    if (Number(withdrawAmount) > stats.unpaidEarnings) {
      return toast.error('Insufficient balance');
    }

    try {
      const { data } = await axios.post('/api/influencer/withdraw', {
        amount: withdrawAmount,
        bankDetails: `UPI: ${bankDetails.upiId} | Bank: ${bankDetails.accountNumber} (${bankDetails.ifsc}) - ${bankDetails.accountHolder}`
      });
      toast.success(data.message);
      setShowWithdrawModal(false);
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-light)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-light)] text-[var(--text-primary)] p-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <AlertCircle size={48} className="text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Dashboard Unavailable</h2>
          <p className="text-[var(--text-secondary)] mb-6">{error || 'Could not load your influencer stats. Please ensure your account is registered as an Influencer.'}</p>
          <button 
            onClick={fetchStats}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)] text-[var(--text-primary)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Influencer Partner Program
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">Track your referrals, earnings, and grow your community.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <CreditCard size={18} />
              Withdraw Commissions
            </button>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 mb-8 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-all"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" />
              Your Partner Referral Link
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-[var(--bg-light)] border border-[var(--border)] rounded-xl px-4 py-3 font-mono text-sm flex items-center justify-between">
                <span className="text-blue-600 truncate">https://vidyajaya.in/signup?ref={referralCode || 'PENDING'}</span>
                <button onClick={copyToClipboard} className="ml-4 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors" disabled={!referralCode}>
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-[var(--text-secondary)]" />}
                </button>
              </div>
              <div className="px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-600 text-sm font-medium flex items-center gap-2">
                <AlertCircle size={16} />
                You earn {stats.commissionRate}% on every Pro subscription!
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Referrals', value: stats.totalMembers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Total Earnings', value: `₹${stats.totalEarned}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Unpaid Earnings', value: `₹${stats.unpaidEarnings}`, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'Commission Rate', value: `${stats.commissionRate}%`, icon: ArrowUpRight, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((item, idx) => (
            <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`${item.bg} p-3 rounded-xl`}>
                  <item.icon size={24} className={item.color} />
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Live</span>
              </div>
              <div className="text-3xl font-bold">{item.value}</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity Table */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Referrals</h3>
            <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-light)]">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {recentReferrals.length > 0 ? recentReferrals.map((ref, idx) => (
                  <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium">{ref.name}</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] text-sm">{ref.email}</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] text-sm">
                      {new Date(ref.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        ref.status === 'Pro' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-gray-500/10 text-[var(--text-secondary)] border border-[var(--border)]'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-[var(--text-secondary)] transition-colors">
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-[var(--text-secondary)]">
                      No referrals found. Start sharing your link to earn!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWithdrawModal(false)}></div>
          <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl">
            <div className="p-6 border-b border-[var(--border)]">
              <h3 className="text-xl font-bold">Withdraw Commissions</h3>
              <p className="text-[var(--text-secondary)] text-sm mt-1">Available balance: ₹{stats.unpaidEarnings}</p>
            </div>
            <form onSubmit={handleWithdraw} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Amount to Withdraw (₹)</label>
                <input 
                  type="number" 
                  min="500"
                  max={stats.unpaidEarnings}
                  required
                  placeholder="Min ₹500"
                  className="w-full bg-[var(--bg-light)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-[var(--text-primary)] transition-colors"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Payout Details (UPI / Bank)</label>
                <input 
                  type="text" 
                  placeholder="UPI ID (preferred)"
                  required
                  className="w-full bg-[var(--bg-light)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-[var(--text-primary)] transition-colors"
                  value={bankDetails.upiId}
                  onChange={(e) => setBankDetails({...bankDetails, upiId: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Account Number"
                  className="w-full bg-[var(--bg-light)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-[var(--text-primary)] transition-colors"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    placeholder="IFSC"
                    className="w-full bg-[var(--bg-light)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-[var(--text-primary)] transition-colors"
                    value={bankDetails.ifsc}
                    onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Name on Account"
                    className="w-full bg-[var(--bg-light)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-[var(--text-primary)] transition-colors"
                    value={bankDetails.accountHolder}
                    onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 px-4 py-3 bg-[var(--bg-light)] text-[var(--text-primary)] rounded-xl font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-[var(--border)]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors"
                >
                  Request Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfluencerDashboard;
