import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';   // ← exact filename match
import toast from 'react-hot-toast';

const DEMO = [
  { label: 'Customer', email: 'customer@dabbsync.in' },
  { label: 'Vendor',   email: 'vendor@dabbsync.in'   },
  { label: 'Admin',    email: 'admin@dabbsync.in'     },
];

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const { login }        = useAuth();
  const { dark, toggle } = useTheme();   // safe — hook always returns an object now
  const navigate         = useNavigate();

  useEffect(() => { setError(''); }, [form.email, form.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email)    return setError('Please enter your email');
    if (!form.password) return setError('Please enter your password');
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      if (user.role === 'vendor')      navigate('/vendor/dashboard');
      else if (user.role === 'admin')  navigate('/admin/dashboard');
      else                             navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-orange-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">

      {/* Theme toggle */}
      <button
        onClick={toggle}
        title="Toggle theme"
        className="fixed top-4 right-4 w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center text-base hover:shadow-md transition-all"
      >
        {dark ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-3 shadow-lg">
            DS
          </div>
          <h1 className="text-2xl font-bold dark:text-white">DabbaSync</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Aapka Tiffin, Aapka Control</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-5 dark:text-white">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
                : 'Sign In'
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            No account?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-4">
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mb-2">
            Demo accounts — click to fill
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO.map(({ label, email }) => (
              <button
                key={email}
                onClick={() => setForm({ email, password: 'password123' })}
                className="py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all"
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-1.5">
            pw: <span className="font-mono">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}