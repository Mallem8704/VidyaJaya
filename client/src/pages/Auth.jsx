import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, User, Phone, BookOpen, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';

const Auth = ({ type }) => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { login, register, isloading, forgotPassword, resetPassword, isAuthenticated, resetLoading } = useAuthStore();

  React.useEffect(() => {
    resetLoading(); // 🔓 CLEAR STUCK BUTTONS ON MOUNT
    
    if (isAuthenticated && type !== 'Reset Password') {
      navigate('/dashboard');
    }

    // 🔗 AUTO-APPLY REFERRAL CODE
    if (type === 'Signup') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlRef = urlParams.get('ref');
      const storedRef = localStorage.getItem('vidyajaya_ref_code');
      
      const finalRef = (urlRef || storedRef)?.toUpperCase();
      
      if (finalRef) {
        setFormData(prev => ({ ...prev, referralCode: finalRef }));
        localStorage.setItem('vidyajaya_ref_code', finalRef); // Ensure it's synced
        toast.success(`Referral Applied: ${finalRef} ✅`, {
            id: 'ref-toast'
        });
      }
    }
  }, [isAuthenticated, type, navigate]);

  // States
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', examGoal: 'UPSC', referralCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Password Strength
  const getPasswordStrength = () => {
    let score = 0;
    if (formData.password.length > 6) score++;
    if (/[A-Z]/.test(formData.password)) score++;
    if (/[0-9]/.test(formData.password)) score++;
    if (/[^A-Za-z0-9]/.test(formData.password)) score++;
    return score;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (type === 'Login') {
        const identifier = loginMethod === 'phone' ? formData.phone : formData.email;
        if (!identifier) {
          return toast.error(`Please provide your ${loginMethod === 'phone' ? 'phone number' : 'email address'}.`);
        }
        await login(identifier, formData.password);
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else if (type === 'Signup') {
        if (!isOtpSent) {
          try {
            const response = await axios.post('/api/verification/send-mobile-otp', { phone: formData.phone });
            setIsOtpSent(true);
            setShowOtpField(true);

            if (response.data?.bypass) {
              // SMS failed (IP blocked etc.) — bypass mode
              toast('SMS unavailable. Use code: 123456 to continue.', {
                icon: '⚠️',
                duration: 6000,
                style: { background: '#fff3cd', color: '#856404' }
              });
            } else {
              toast.success(`OTP sent to ${formData.phone}! Check your messages.`);
            }
            return;
          } catch (err) {
            // Even if the request fully fails, let the user try with bypass code
            console.error('[SIGNUP_OTP]', err?.response?.data || err.message);
            setIsOtpSent(true);
            setShowOtpField(true);
            toast('Could not send SMS. Use code: 123456 to continue.', {
              icon: '⚠️',
              duration: 6000,
              style: { background: '#fff3cd', color: '#856404' }
            });
            return;
          }
        }

        // Proceed to registration (Backend will verify the OTP)
        await register({ ...formData, otp });
        toast.success('Registration successful. Welcome to VidyaJaya!');
        navigate('/dashboard');
      } else if (type === 'Forgot Password') {
        await forgotPassword(formData.email);
        toast.success('Reset link sent to your email');
      } else if (type === 'Reset Password') {
        if (formData.password !== formData.confirmPassword) {
          return toast.error('Passwords do not match');
        }
        await resetPassword(token, formData.password);
        toast.success('Password reset successful. Logging you in...');
        navigate('/dashboard');
      }
    } catch (error) {
      const serverError = error.response?.data;
      const errorMessage = serverError?.error
        ? `${serverError.message}: ${serverError.error}`
        : (serverError?.message || error.message || 'Authentication failed');

      toast.error(errorMessage, {
        duration: 5000,
        style: { maxWidth: '500px' }
      });
    }
  };

  // UI Components
  const LeftPanel = () => (
    <div className="hidden lg:flex flex-col justify-center w-1/2 bg-primary p-12 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-light rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-secondary rounded-full blur-3xl opacity-20"></div>

      <div className="z-10 relative">
        <Link to="/" className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center overflow-hidden shadow-lg">
            <img src="/logo.png" alt="V" className="w-full h-full object-contain" />
          </div>
          <span className="font-heading font-bold text-3xl tracking-wide">VidyaJaya</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
            Where Knowledge <br />
            <span className="text-secondary">Pays Off</span>
          </h1>
          <p className="text-lg text-gray-300 mb-10 max-w-md">
            Join 2.5L+ students building their streaks and conquering UPSC, SSC, and Banking exams with AI-powered practice.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-primary-light bg-opacity-40 p-4 rounded-xl backdrop-blur-sm border border-primary-light">
              <div className="p-3 bg-secondary bg-opacity-20 rounded-lg text-secondary">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg">1. Join with OTP</h4>
                <p className="text-sm text-gray-400">Zero friction, zero credit card needed.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-primary-light bg-opacity-40 p-4 rounded-xl backdrop-blur-sm border border-primary-light">
              <div className="p-3 bg-accent-green bg-opacity-20 rounded-lg text-accent-green">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg">2. Verify via DigiLocker</h4>
                <p className="text-sm text-gray-400">Aadhaar-based KYC for reward eligibility.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-primary-light bg-opacity-40 p-4 rounded-xl backdrop-blur-sm border border-primary-light">
              <div className="p-3 bg-accent-purple bg-opacity-20 rounded-lg text-accent-purple">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg">3. Compete in 6 Sectors</h4>
                <p className="text-sm text-gray-400">UPSC, Finance, S&T, and more.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-primary-light bg-opacity-40 p-4 rounded-xl backdrop-blur-sm border border-primary-light">
              <div className="p-3 bg-orange-400 bg-opacity-20 rounded-lg text-orange-400">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg">4. Instant Rewards</h4>
                <p className="text-sm text-gray-400">Withdraw to bank account anytime (Min ₹50).</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[var(--bg-light)]">
      <LeftPanel />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-10">
            <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="V" className="w-full h-full object-contain" />
            </div>
            <span className="font-heading font-bold text-2xl text-[var(--text-primary)]">VidyaJaya</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-3xl font-heading font-bold mb-2 text-[var(--text-primary)]">
                {type === 'Login' ? 'Welcome Back!' :
                  type === 'Signup' ? 'Create Account' :
                    type === 'Forgot Password' ? 'Reset Password' :
                      'Set New Password'}
              </h2>
              <p className="text-[var(--text-secondary)]">
                {type === 'Login' ? 'Enter your details to access your dashboard.' :
                  type === 'Signup' ? 'Start your journey to success today.' :
                    type === 'Forgot Password' ? 'Enter your email to receive a reset link.' :
                      'Enter your new password below.'}
              </p>
            </div>

            {type === 'Login' && (
              <div className="flex bg-[var(--bg-light)] p-1 rounded-xl mb-8 border border-[var(--border)] relative z-10">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('email'); setIsOtpSent(false); setShowOtpField(false); }}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${loginMethod === 'email' ? 'bg-white shadow-md text-primary translate-y-0' : 'text-[var(--text-secondary)] hover:text-primary'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Mail size={16} /> Email Login
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${loginMethod === 'phone' ? 'bg-white shadow-md text-primary translate-y-0' : 'text-[var(--text-secondary)] hover:text-primary'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Phone size={16} /> Phone + Password
                  </div>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {type === 'Signup' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <User size={18} />
                      </div>
                      <input
                        type="text" name="name"
                        value={formData.name} onChange={handleChange}
                        className="pl-10 w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="Rahul Kumar" required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel" name="phone"
                        value={formData.phone} onChange={handleChange}
                        className="pl-10 w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="+91 9876543210" required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email" name="email"
                        value={formData.email} onChange={handleChange}
                        className="pl-10 w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="you@example.com" required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Exam Goal</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <BookOpen size={18} />
                      </div>
                      <select
                        name="examGoal"
                        value={formData.examGoal} onChange={handleChange}
                        className="pl-10 w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      >
                        <option value="UPSC">UPSC</option>
                        <option value="SSC">SSC</option>
                        <option value="RRB">RRB</option>
                        <option value="Banking">Banking</option>
                        <option value="Reasoning">Reasoning</option>
                        <option value="Aptitude">Aptitude</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Referral Code (Optional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <ArrowRight size={18} />
                      </div>
                      <input
                        type="text" name="referralCode"
                        value={formData.referralCode} onChange={handleChange}
                        className={`pl-10 w-full p-3 rounded-xl border ${formData.referralCode ? 'border-accent-green' : 'border-[var(--border)]'} bg-[var(--bg-card)] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all uppercase`}
                        placeholder="ABC123"
                      />
                    </div>
                  </div>

                  {showOtpField && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 mb-4">
                      <label className="block text-sm font-medium mb-1 text-secondary">Verification Code (OTP)</label>
                      <input
                        type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                        className="w-full p-4 text-center text-2xl tracking-widest rounded-xl border-2 border-secondary bg-[var(--bg-card)] focus:ring-2 focus:ring-secondary outline-none transition-all"
                        placeholder="000000" maxLength={6}
                      />
                      <p className="text-xs text-[var(--text-secondary)] mt-2">Enter the 6-digit code sent to {formData.phone}</p>
                    </motion.div>
                  )}
                </>
              )}

              {type === 'Login' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
                    {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      {loginMethod === 'email' ? <Mail size={18} /> : <Phone size={18} />}
                    </div>
                    <input
                      type={loginMethod === 'email' ? 'email' : 'tel'}
                      name={loginMethod === 'email' ? 'email' : 'phone'}
                      value={loginMethod === 'email' ? formData.email : formData.phone}
                      onChange={handleChange}
                      className="pl-10 w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder={loginMethod === 'email' ? 'you@example.com' : 'Enter registered mobile number'}
                      required
                    />
                  </div>
                </div>
              )}

              {type === 'Forgot Password' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email" name="email"
                      value={formData.email} onChange={handleChange}
                      className="pl-10 w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="you@example.com" required
                    />
                  </div>
                </div>
              )}

              {(type === 'Login' || type === 'Signup' || type === 'Reset Password') && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)] flex justify-between">
                    <span>{type === 'Reset Password' ? 'New Password' : 'Password'}</span>
                    {type === 'Login' && (
                      <Link to="/forgot-password" university-id="forgot-password-link" className="text-secondary hover:underline text-xs">Forgot Password?</Link>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"} name="password"
                      value={formData.password} onChange={handleChange}
                      className="pl-10 pr-10 w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="••••••••" required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {(type === 'Signup' || type === 'Reset Password') && formData.password && (
                    <div className="mt-2 flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i < getPasswordStrength()
                              ? getPasswordStrength() <= 2 ? 'bg-red-500' : getPasswordStrength() === 3 ? 'bg-yellow-500' : 'bg-green-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

                  {type === 'Reset Password' && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Lock size={18} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"} name="confirmPassword"
                          value={formData.confirmPassword} onChange={handleChange}
                          className="pl-10 pr-10 w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                          placeholder="••••••••" required
                        />
                      </div>
                    </div>
                  )}

              {type === 'Signup' && (
                <div className="flex items-start mb-6">
                  <div className="flex items-center h-5">
                    <input type="checkbox" required className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary" />
                  </div>
                  <div className="ml-2 text-sm text-[var(--text-secondary)]">
                    <p>I agree to the <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a> and <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>.</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isloading}
                className="w-full btn btn-primary flex justify-center items-center gap-2 py-3.5 text-lg truncate relative group"
              >
                {isloading ? (
                  <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
                ) : (
                  <>
                    {type === 'Login' ? 'Log In' :
                      type === 'Signup' ? 'Create Account' :
                        type === 'Forgot Password' ? 'Send Reset Link' :
                          'Reset Password'}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {(type === 'Login' || type === 'Signup') && (
                <>
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[var(--border)]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-[var(--bg-light)] text-[var(--text-secondary)] font-medium">OR</span>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      const { loginWithGoogle } = useAuthStore.getState();
                      loginWithGoogle();
                    }}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white dark:bg-gray-800 border border-[var(--border)] rounded-xl text-[var(--text-primary)] font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    <span>Continue with Google</span>
                  </button>
                </>
              )}

              {/* Toggle links */}
              <div className="text-center mt-6 text-[var(--text-secondary)]">
                {type === 'Login' ? (
                  <p>Don't have an account? <Link to="/signup" className="text-secondary font-semibold hover:underline">Sign up</Link></p>
                ) : type === 'Signup' ? (
                  <p>Already have an account? <Link to="/login" className="text-secondary font-semibold hover:underline">Log in</Link></p>
                ) : type === 'Forgot Password' || type === 'Reset Password' ? (
                  <p>Remember your password? <Link to="/login" className="text-secondary font-semibold hover:underline">Log in</Link></p>
                ) : null}
              </div>

            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
