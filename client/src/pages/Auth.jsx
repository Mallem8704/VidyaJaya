import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, User, Phone, BookOpen, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';

const Auth = ({ type }) => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { login, register, isloading, forgotPassword, resetPassword, isAuthenticated } = useAuthStore();
  
  React.useEffect(() => {
    if (isAuthenticated && type !== 'Reset Password') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, type, navigate]);
  
  // States
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', examGoal: 'UPSC'
  });
  const [showPassword, setShowPassword] = useState(false);

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
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else if (type === 'Signup') {
        await register(formData);
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
      toast.error(error.response?.data?.message || error.message || 'Authentication failed');
    }
  };

  // UI Components
  const LeftPanel = () => (
    <div className="hidden lg:flex flex-col justify-center w-1/2 bg-primary p-12 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-light rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-secondary rounded-full blur-3xl opacity-20"></div>
      
      <div className="z-10 relative">
        <Link to="/" className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center font-bold text-white text-2xl shadow-lg">V</div>
          <span className="font-heading font-bold text-3xl tracking-wide">VidyaJaya</span>
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
            Where Knowledge <br/>
            Turns <span className="text-secondary">Victory</span>
          </h1>
          <p className="text-lg text-gray-300 mb-10 max-w-md">
            Join 2.5L+ students building their streaks and conquering UPSC, SSC, and Banking exams with AI-powered practice.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-primary-light bg-opacity-40 p-4 rounded-xl backdrop-blur-sm border border-primary-light">
              <div className="p-3 bg-accent-green bg-opacity-20 rounded-lg text-accent-green">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Daily Streaks</h4>
                <p className="text-sm text-gray-400">Build habits and earn rewards</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-primary-light bg-opacity-40 p-4 rounded-xl backdrop-blur-sm border border-primary-light">
              <div className="p-3 bg-accent-purple bg-opacity-20 rounded-lg text-accent-purple">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg">AI Analytics</h4>
                <p className="text-sm text-gray-400">Identify weaknesses instantly</p>
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
            <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center font-bold text-white text-xl">V</div>
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Form Fields Based on Type */}
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
                </>
              )}

              {(type === 'Login' || type === 'Signup' || type === 'Forgot Password') && (
                <>
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
                </>
              )}

              {(type === 'Login' || type === 'Signup' || type === 'Reset Password') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)] flex justify-between">
                      <span>{type === 'Reset Password' ? 'New Password' : 'Password'}</span>
                      {type === 'Login' && (
                        <Link to="/forgot-password" className="text-secondary hover:underline text-xs">Forgot Password?</Link>
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
                    {/* Password Strength Indicator */}
                    {(type === 'Signup' || type === 'Reset Password') && formData.password && (
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div 
                            key={level} 
                            className={`h-1.5 w-full rounded-full ${
                              getPasswordStrength() >= level 
                                ? (getPasswordStrength() <= 2 ? 'bg-red-400' : getPasswordStrength() === 3 ? 'bg-yellow-400' : 'bg-green-500')
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
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
