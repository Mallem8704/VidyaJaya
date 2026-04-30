import React, { useState, useEffect } from 'react';
import { Award, Lock, Star, Zap, CheckCircle, ShieldCheck, Loader2, Snowflake, Frame, Bot, Coins, ShoppingBag, Diamond, History, Trophy } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const mockRewards = [
  { id: 'freeze', title: 'Streak Freeze', cost: 50, icon: Snowflake, desc: 'Saves your streak if you miss a day. (Max 2)' },
  { id: 'frame', title: 'Profile Frame: Conqueror', cost: 200, icon: Frame, desc: 'Adds a flaming border to your avatar.' },
  { id: 'token', title: '1 AI Doubt Token', cost: 100, icon: Bot, desc: 'Get an instant step-by-step GPT explanation.' },
];

const Rewards = () => {
  const { user, updateUser } = useAuthStore();
  const [loadingId, setLoadingId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [realCoins, setRealCoins] = useState(user?.coins || 0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const fetchRewardsData = async () => {
      try {
        const [transRes, balRes] = await Promise.all([
          axios.get('/api/rewards'),
          axios.get('/api/rewards/balance')
        ]);
        setTransactions(transRes.data);
        setRealCoins(balRes.data.coins);
      } catch (err) {
        console.error("Failed to fetch rewards data", err);
      } finally {
        setLoadingTransactions(false);
      }
    };
    fetchRewardsData();
  }, []);

  // BUG 13 FIX: Real Razorpay payment handler
  const handleSubscribe = async (amount, planName) => {
    const payToast = toast.loading('Creating your order...');
    try {
      // 1. Create order on backend
      const orderRes = await axios.post('/api/payments/create-order', { amount, planName });
      const order = orderRes.data;
      toast.dismiss(payToast);

      // 2. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SgtHYjaxxDOJUk',
        amount: order.amount,
        currency: 'INR',
        name: 'VidyaJaya',
        description: `${planName} Subscription`,
        order_id: order.id,
        handler: async (response) => {
          // 3. Verify payment on backend
          const verifyToast = toast.loading('Verifying payment...');
          try {
            await axios.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planName
            });
            updateUser({ plan: 'premium' });
            toast.success('🎉 Welcome to VidyaJaya PRO!', { id: verifyToast });
            // Refresh balance
            const balRes = await axios.get('/api/rewards/balance');
            setRealCoins(balRes.data.coins);
          } catch (err) {
            toast.error('Payment verification failed. Contact support.', { id: verifyToast });
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: { color: '#FF6B00' }
      };

      // Dynamically load Razorpay script if not loaded
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.dismiss(payToast);
      toast.error(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
    }
  };


  const coins = realCoins;

  const handlePurchase = async (reward) => {
    if (coins < reward.cost) {
      return toast.error(`Not enough coins! You need ${reward.cost}`, { icon: <Coins size={16} className="text-accent-gold" /> });
    }

    if (reward.id === 'freeze') {
      setLoadingId('freeze');
      try {
        const res = await axios.post('/api/streak/freeze');
        updateUser({ 
          freezesRemaining: res.data.freezesRemaining
        });
        setRealCoins(res.data.coins);
        // Refresh transactions
        const transRes = await axios.get('/api/rewards');
        setTransactions(transRes.data);
        toast.success("Streak Freeze purchased!");
      } catch (err) {
        toast.error(err.response?.data?.message || "Purchase failed");
      } finally {
        setLoadingId(null);
      }
    } else {
      toast.error("This reward is currently out of stock!");
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!user?.kyc_verified) {
      return toast((t) => (
        <span className="flex flex-col gap-2">
          <span className="font-bold text-sm">KYC Verification Required</span>
          <span className="text-xs text-gray-500">You must verify your identity to withdraw cash rewards.</span>
          <button 
            onClick={() => { toast.dismiss(t.id); window.location.href='/kyc'; }}
            className="bg-orange-500 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg uppercase tracking-wider"
          >
            Verify Now
          </button>
        </span>
      ), { duration: 5000, icon: '🛡️' });
    }
    const amountNum = Number(withdrawAmount);
    if (amountNum < 50) {
      return toast.error("Minimum withdrawal is ₹50");
    }
    if (amountNum > coins) {
      return toast.error("Insufficient coin balance!");
    }
    if (!upiId.includes('@')) {
      return toast.error("Please enter a valid UPI ID");
    }

    setIsWithdrawing(true);
    try {
      const res = await axios.post('/api/rewards/withdraw', {
        amount: amountNum,
        upiId: upiId
      });
      toast.success(res.data.message);
      setWithdrawAmount('');
      setUpiId('');
      // Refresh balance
      const balRes = await axios.get('/api/rewards/balance');
      setRealCoins(balRes.data.coins);
      const transRes = await axios.get('/api/rewards');
      setTransactions(transRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-10">
      
      {/* Overview Head */}
      <div className="bg-primary rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
        <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
           <h2 className="text-3xl font-heading font-bold mb-2">Rewards Strategy Room</h2>
           <p className="text-primary-light">Spend your hard-earned performance coins here.</p>
        </div>
        <div className="relative z-10 flex flex-col items-center md:items-end">
           <span className="text-sm text-gray-300 font-bold uppercase tracking-widest mb-1">Your Balance</span>
           <div className="text-5xl font-heading font-bold flex items-center gap-3 text-accent-gold">
              <Award size={40} className="text-accent-gold" />
              {coins} <span className="text-lg">Coins</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         
         {/* Store items */}
         <div className="space-y-6">
            <h3 className="text-2xl font-heading font-bold flex items-center gap-2">
              <ShoppingBag className="text-secondary" /> Tactical Upgrades
            </h3>
            <div className="grid grid-cols-1 gap-4">
               {mockRewards.map(reward => (
                  <div key={reward.id} className="card p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform border border-transparent hover:border-secondary">
                     <div className="text-secondary bg-[var(--bg-light)] p-3 rounded-xl border border-[var(--border)]">
                        <reward.icon size={32} />
                     </div>
                     <div className="flex-1">
                        <h4 className="font-bold text-lg">{reward.title}</h4>
                        <p className="text-sm text-[var(--text-secondary)]">{reward.desc}</p>
                     </div>
                     <button 
                        onClick={() => handlePurchase(reward)}
                        disabled={loadingId === reward.id}
                        className="btn bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-[rgba(255,165,0,0.1)] dark:text-orange-400 dark:hover:bg-[rgba(255,165,0,0.2)] font-bold px-4 py-2 flex items-center gap-1 border border-orange-300 dark:border-orange-900 border-opacity-50"
                     >
                        {loadingId === reward.id ? <Loader2 size={16} className="animate-spin" /> : <Award size={16}/>} 
                        {reward.cost}
                     </button>
                  </div>
               ))}
               
               <div className="card p-5 flex items-center gap-4 opacity-50 bg-[var(--bg-light)]">
                   <div className="text-gray-400 bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border)] grayscale">
                      <Trophy size={32} />
                   </div>
                   <div className="flex-1">
                      <h4 className="font-bold text-lg flex items-center gap-2">Grandmaster Title <Lock size={16}/></h4>
                      <p className="text-sm text-[var(--text-secondary)]">Requires 100+ day streak.</p>
                   </div>
                   <button disabled className="btn btn-outline text-gray-500 cursor-not-allowed">
                      Need 5000
                   </button>
               </div>
            </div>
         </div>

         {/* Subscription Plans */}
         <div className="space-y-6">
            <h3 className="text-2xl font-heading font-bold flex items-center gap-2">
              💎 VidyaJaya Supercharge Plan
            </h3>
            
            <div className="card p-8 border-2 border-secondary relative overflow-hidden bg-gradient-to-b from-[var(--bg-card)] to-[rgba(255,107,0,0.02)]">
               <div className="absolute top-4 right-4 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                 Weekly / Monthly Available
               </div>
               
               <h4 className="text-2xl font-bold mb-2">VidyaJaya PRO</h4>
               <p className="text-[var(--text-secondary)] mb-6">Unlock the full power of India's most intelligent prep engine.</p>
               
               <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                     <CheckCircle size={20} className="text-accent-green shrink-0 mt-0.5" />
                     <span className="font-medium text-[15px]">Unlimited AI Doubt Solving via Screenshot</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <CheckCircle size={20} className="text-accent-green shrink-0 mt-0.5" />
                     <span className="font-medium text-[15px]">Access to 5000+ Premium Sectional Mocks</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <CheckCircle size={20} className="text-accent-green shrink-0 mt-0.5" />
                     <span className="font-medium text-[15px]">Detailed AI Performance Diagnostic Reports</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <ShieldCheck size={20} className="text-accent-green shrink-0 mt-0.5" />
                     <span className="font-medium text-[15px]">Ad-Free Experience & Priority Rankings</span>
                  </li>
               </ul>
               
               <div className="grid grid-cols-2 gap-4">
                  {/* BUG 13 FIX: Added onClick handlers for Razorpay */}
                  <button 
                    onClick={() => handleSubscribe(149, 'Weekly Plan')}
                    className="btn btn-outline border-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col items-center p-4 h-auto relative"
                  >
                     <span className="text-xl font-bold mb-1">₹149</span>
                     <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Weekly Plan</span>
                  </button>
                  <button 
                    onClick={() => handleSubscribe(499, 'Monthly Plan')}
                    className="btn bg-red-600 hover:bg-red-700 text-white flex flex-col items-center p-4 h-auto shadow-lg shadow-red-600/30 border-0 relative"
                  >
                     <span className="absolute -top-3 bg-accent-gold text-white text-[10px] px-2 py-0.5 rounded shadow">Save 20%</span>
                     <span className="text-xl font-bold mb-1">₹499</span>
                     <span className="text-xs font-bold text-rose-100 uppercase">Monthly Plan</span>
                  </button>
               </div>
               
               <p className="text-center text-xs text-[var(--text-secondary)] mt-6 flex items-center justify-center gap-1">
                 <Zap size={14} className="text-secondary" /> Cancel anytime. Secure payments.
               </p>
            </div>
         </div>

      </div>

      {/* Transactions History */}
      <div className="mt-12 space-y-6">
        <h3 className="text-2xl font-heading font-bold flex items-center gap-2">
          <History className="text-secondary" /> Transaction History
        </h3>
        <div className="card p-6 border border-[var(--border)] overflow-hidden">
          {loadingTransactions ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-secondary" size={32} />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-[var(--text-secondary)] py-8">No transactions yet. Complete tests to earn coins!</p>
          ) : (
            <div className="space-y-4">
              {transactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-light)] rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${t.transaction_type === 'earned' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                      {t.transaction_type === 'earned' ? <CheckCircle size={18} /> : <Zap size={18} />}
                    </div>
                    <div>
                      <p className="font-bold">{t.description || t.source}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{new Date(t.created_at).toLocaleDateString()} • {new Date(t.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${t.transaction_type === 'earned' ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                    {t.transaction_type === 'earned' ? '+' : '-'}{t.amount} <Coins size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
