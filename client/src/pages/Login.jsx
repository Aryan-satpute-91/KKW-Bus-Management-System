import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { authAPI } from '../services/api';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  // Request Access State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: '', email: '', purpose: '' });
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    if (!requestForm.name || !requestForm.email || !requestForm.purpose) {
      toast.error('Please fill all fields');
      return;
    }
    setRequestLoading(true);
    try {
      await authAPI.requestAccess(requestForm);
      toast.success('Request sent successfully!');
      setShowRequestModal(false);
      setRequestForm({ name: '', email: '', purpose: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email');
      return;
    }
    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      toast.success('Password reset email sent');
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full font-sans">
      {/* Left Panel */}
      <section className="hidden lg:flex lg:w-1/2 bg-login-gradient flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 right-[-30px] w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

        <div className="z-10 text-center max-w-md">
          {/* Logo container */}
          <div className="mb-8 inline-block p-5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '3rem' }}>directions_bus</span>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-3 uppercase tracking-tight leading-tight">
            KKW Bus Maintenance <br /> Management System
          </h1>
          <p className="text-blue-200 text-base font-medium mb-4">
            Smart Digital Transport Management
          </p>
          <p className="text-white/50 text-sm mb-10">
            K.K. Wagh Institute of Engineering Education &amp; Research, Nashik
          </p>

          {/* Feature icons */}
          <div className="grid grid-cols-3 gap-6 opacity-70">
            {[
              { icon: 'shield_with_heart', label: 'Safety First' },
              { icon: 'precision_manufacturing', label: 'Efficiency' },
              { icon: 'analytics', label: 'Real-time' },
            ].map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl">{f.icon}</span>
                </div>
                <span className="text-white text-xs font-semibold uppercase tracking-wider">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right Panel */}
      <section className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white p-8">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-white text-3xl">directions_bus</span>
          </div>
          <h2 className="text-xl font-bold text-primary uppercase tracking-tighter">KKW BUS</h2>
        </div>

        <div className="w-full max-w-[420px]">
          <div className="bg-white p-8 rounded-xl border border-surface-highest shadow-card">
            {/* Bus icon */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-3xl">directions_bus</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-primary mb-1">Welcome Back</h2>
              <p className="text-sm text-gray-500">Login to manage bus maintenance records</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                  Username or Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-secondary text-[20px] transition-colors">person</span>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input-field pl-11"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-secondary text-[20px] transition-colors">lock</span>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-11 pr-11"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-secondary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 text-secondary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600 select-none">Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="text-sm text-secondary hover:text-primary font-medium hover:underline transition-all"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit */}
              <button
                id="login-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-secondary text-white font-bold uppercase tracking-widest rounded hover:bg-primary transition-all duration-200 shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </>
                ) : 'Login'}
              </button>
            </form>

            <div className="text-center pt-4">
              <button 
                onClick={() => setShowRequestModal(true)}
                className="text-xs text-secondary hover:text-primary font-bold uppercase tracking-wider transition-colors"
              >
                Need access? Request Here
              </button>
            </div>

            {/* Request Access Modal */}
            {showRequestModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-surface-low">
                    <h3 className="font-bold text-primary">Request Access</h3>
                    <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <form onSubmit={handleRequestAccess} className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        className="input-field" 
                        placeholder="John Doe"
                        value={requestForm.name}
                        onChange={(e) => setRequestForm({...requestForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        className="input-field" 
                        placeholder="john@example.com"
                        value={requestForm.email}
                        onChange={(e) => setRequestForm({...requestForm, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Purpose/Department</label>
                      <textarea 
                        required 
                        rows="3" 
                        className="input-field" 
                        placeholder="Why do you need access?"
                        value={requestForm.purpose}
                        onChange={(e) => setRequestForm({...requestForm, purpose: e.target.value})}
                      ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      disabled={requestLoading}
                      className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-secondary transition-all disabled:opacity-50"
                    >
                      {requestLoading ? 'Sending...' : 'Submit Request'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {showForgotModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-surface-low">
                    <h3 className="font-bold text-primary">Reset Password</h3>
                    <button onClick={() => setShowForgotModal(false)} className="text-gray-400 hover:text-gray-600">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        className="input-field"
                        placeholder="john@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-secondary transition-all disabled:opacity-50"
                    >
                      {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              © 2025-26 K.K. Wagh Institute of Engineering Education &amp; Research
            </p>
            <div className="flex gap-6 justify-center mt-2">
              <span className="text-xs text-gray-300 hover:text-gray-500 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="text-xs text-gray-300 hover:text-gray-500 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
};

export default Login;
