import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-5">
      <h1 className="text-xl font-bold">Profile</h1>
      <div className="card text-center">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 text-2xl font-bold mx-auto mb-3">
          {user?.name?.slice(0,2).toUpperCase()}
        </div>
        <h2 className="font-semibold text-gray-900">{user?.name}</h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
        <span className="badge-amber mt-2">{user?.role}</span>
      </div>
      <div className="card space-y-4">
        <h3 className="font-semibold">Edit Profile</h3>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
      <button onClick={logout} className="btn-outline w-full text-red-500 border-red-200">Sign Out</button>
    </div>
  );
}
