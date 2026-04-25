import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      if (user.role === 'vendor') navigate('/vendor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">DS</div>
          <h1 className="text-2xl font-bold text-gray-900">DabbaSync</h1>
          <p className="text-gray-500 mt-1">Aapka Tiffin, Aapka Control</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="input" type="email" required placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input className="input" type="password" required placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            No account? <Link to="/register" className="text-brand-600 font-medium hover:underline">Register</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">Demo: customer@test.com / vendor@test.com / admin@test.com · pw: password123</p>
      </div>
    </div>
  );
}
