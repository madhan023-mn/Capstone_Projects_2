import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.user.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setFormError(result.message);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFormError('');
  };

  return (
    <div className="min-h-screen bg-yellow-50/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-slate-950 font-bold shadow-xs">
            <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            Market<span className="text-amber-500">Verse</span>
          </span>
        </Link>
        <h2 className="text-center text-2xl font-extrabold text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500">
          Or{' '}
          <Link to="/register" className="font-bold text-amber-700 hover:text-amber-800">
            create a new customer or vendor account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xs rounded-2xl sm:px-8 border border-yellow-200/90">
          
          {isExpired && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-amber-900 text-xs rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Your session has expired. Please log in again to continue.</span>
            </div>
          )}

          {formError && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email address
              </label>
              <div className="mt-1 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-slate-900 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-xs text-xs font-black text-slate-950 bg-yellow-400 hover:bg-yellow-500 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Quick Demo Logins for Evaluation & Mentor Testing */}
          <div className="mt-6 pt-5 border-t border-yellow-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>One-Click Demo Credentials:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@marketverse.com', 'Admin@123456')}
                className="py-1.5 px-2 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-slate-900 rounded-xl text-xs font-bold transition text-center shadow-xs"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('apex@vendor.com', 'Vendor@123456')}
                className="py-1.5 px-2 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-slate-900 rounded-xl text-xs font-bold transition text-center shadow-xs"
              >
                Vendor
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('john@example.com', 'Customer@123456')}
                className="py-1.5 px-2 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-slate-900 rounded-xl text-xs font-bold transition text-center shadow-xs"
              >
                Customer
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
