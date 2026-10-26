import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  Store, 
  User 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  // Load remembered credentials from localStorage if present
  const savedCredentials = (() => {
    try {
      const data = localStorage.getItem('marketverse_remembered_credentials');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  })();

  const [email, setEmail] = useState(savedCredentials?.email || '');
  const [password, setPassword] = useState(savedCredentials?.password || '');
  const [rememberMe, setRememberMe] = useState(Boolean(savedCredentials?.remember));
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeQuickRole, setActiveQuickRole] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isExpired = searchParams.get('expired') === 'true';

  // Dismiss expired query parameter once user interacts
  const dismissExpiredBanner = () => {
    if (isExpired) {
      navigate('/login', { replace: true });
    }
  };

  const handleSuccessfulAuth = (user) => {
    // Save or clear credentials according to Remember Me checkbox
    if (rememberMe) {
      try {
        localStorage.setItem(
          'marketverse_remembered_credentials',
          JSON.stringify({ email: email.trim().toLowerCase(), password, remember: true })
        );
      } catch (err) {
        console.warn('Could not save credentials to localStorage:', err);
      }
    } else {
      localStorage.removeItem('marketverse_remembered_credentials');
    }

    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user.role === 'vendor') {
      navigate('/vendor/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setFormError('');
    dismissExpiredBanner();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(cleanEmail, password);
    setIsSubmitting(false);

    if (result.success) {
      handleSuccessfulAuth(result.user);
    } else {
      setFormError(result.message || 'Incorrect email or password. Please try again.');
    }
  };

  // Instant 1-click login helper for evaluation & fast switching
  const handleQuickLogin = async (demoEmail, demoPassword, role) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFormError('');
    dismissExpiredBanner();
    setActiveQuickRole(role);
    setIsSubmitting(true);

    const result = await login(demoEmail.trim().toLowerCase(), demoPassword);
    setIsSubmitting(false);
    setActiveQuickRole(null);

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem(
          'marketverse_remembered_credentials',
          JSON.stringify({ email: demoEmail, password: demoPassword, remember: true })
        );
      }
      handleSuccessfulAuth(result.user);
    } else {
      setFormError(result.message || 'Login failed for selected demo account.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/60 via-yellow-50/40 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-3 group">
          <div className="w-11 h-11 rounded-2xl bg-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-md group-hover:scale-105 transition">
            <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-3xl font-black text-slate-900 tracking-tight">
            Market<span className="text-amber-500">Verse</span>
          </span>
        </Link>
        <h2 className="text-center text-2xl font-black text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500">
          Sign in or choose an account below to access your dashboard
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 sm:px-8 shadow-xl shadow-slate-200/50 rounded-3xl border border-yellow-200/80">
          
          {/* Expired Session Alert */}
          {isExpired && (
            <div className="mb-5 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-2xl p-3.5 flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Your session has expired</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Please log in again using your credentials or one-click demo login below.
                </p>
              </div>
            </div>
          )}

          {/* Form Error Alert */}
          {formError && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl p-3.5 flex items-start gap-2.5 shadow-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold">
                {formError}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="email" 
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Email address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formError) setFormError('');
                    dismissExpiredBanner();
                  }}
                  required
                  placeholder="admin@marketverse.com"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-slate-900 font-medium transition"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) setFormError('');
                    dismissExpiredBanner();
                  }}
                  required
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-slate-900 font-medium transition"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Save Credentials Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-400 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-600">
                  Save credentials & stay signed in
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-sm text-sm font-black text-slate-950 bg-yellow-400 hover:bg-yellow-500 active:scale-[0.99] transition disabled:opacity-50 mt-2"
            >
              {isSubmitting && !activeQuickRole ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant 1-Click Demo Logins:</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Pre-configured
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickLogin('admin@marketverse.com', 'Admin@123456', 'admin')}
                className={`py-2 px-2.5 rounded-xl text-left border transition flex flex-col items-start gap-0.5 ${
                  email === 'admin@marketverse.com'
                    ? 'bg-amber-100/70 border-amber-300 text-slate-900 shadow-xs'
                    : 'bg-yellow-50/50 hover:bg-yellow-100/60 border-yellow-200/80 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-black text-amber-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium truncate w-full">
                  Full control
                </span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickLogin('apex@vendor.com', 'Vendor@123456', 'vendor')}
                className={`py-2 px-2.5 rounded-xl text-left border transition flex flex-col items-start gap-0.5 ${
                  email === 'apex@vendor.com'
                    ? 'bg-amber-100/70 border-amber-300 text-slate-900 shadow-xs'
                    : 'bg-yellow-50/50 hover:bg-yellow-100/60 border-yellow-200/80 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-black text-amber-900">
                  <Store className="w-3.5 h-3.5 text-amber-600" />
                  <span>Vendor</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium truncate w-full">
                  Apex Tech
                </span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickLogin('john@example.com', 'Customer@123456', 'customer')}
                className={`py-2 px-2.5 rounded-xl text-left border transition flex flex-col items-start gap-0.5 ${
                  email === 'john@example.com'
                    ? 'bg-amber-100/70 border-amber-300 text-slate-900 shadow-xs'
                    : 'bg-yellow-50/50 hover:bg-yellow-100/60 border-yellow-200/80 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-black text-amber-900">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>Customer</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium truncate w-full">
                  John Doe
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-bold text-amber-700 hover:text-amber-800 transition">
                Create a new account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
