import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', role:'customer', referralCode:'' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created!');
      if (user.role === 'vendor') navigate('/vendor/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const f = (field) => ({ value: form[field], onChange: e => setForm({ ...form, [field]: e.target.value }) });

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">DS</div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input className="input" required placeholder="Priya Mehta" {...f('name')} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input className="input" type="email" required placeholder="you@example.com" {...f('email')} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input className="input" type="tel" required placeholder="9876543210" {...f('phone')} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input className="input" type="password" required minLength={6} placeholder="min 6 characters" {...f('password')} /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
              <select className="input" {...f('role')}>
                <option value="customer">Customer</option>
                <option value="vendor">Tiffin Vendor</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Referral Code (optional)</label><input className="input" placeholder="FRIEND200" {...f('referralCode')} /></div>
            <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">Already have an account? <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
