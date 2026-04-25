import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState({});
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data.data));
    api.get('/admin/vendors').then(({ data }) => setVendors(data.data));
  }, []);

  const approveVendor = async (id) => {
    try { await api.put(`/admin/vendors/${id}/approve`); toast.success('Vendor approved'); api.get('/admin/vendors').then(({ data }) => setVendors(data.data)); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
            <p className="text-gray-500 text-sm">DabbaSync Platform Dashboard</p>
          </div>
          <button onClick={logout} className="btn-outline text-sm text-red-500 border-red-200">Sign Out</button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label:'Total Customers', value: stats.totalUsers || 0, color:'text-blue-600', bg:'bg-blue-50' },
            { label:'Active Vendors', value: stats.totalVendors || 0, color:'text-forest-600', bg:'bg-forest-100' },
            { label:'Active Subs', value: stats.totalSubs || 0, color:'text-brand-600', bg:'bg-brand-50' },
            { label:'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue || 0), color:'text-forest-600', bg:'bg-forest-100' },
          ].map(s => (
            <div key={s.label} className={`card ${s.bg} border-0`}>
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Vendor Applications</h3>
            {stats.pendingVendors > 0 && <span className="badge-coral">{stats.pendingVendors} pending</span>}
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-400 border-b border-gray-100">
              <th className="pb-2">Business</th><th className="pb-2">Owner</th><th className="pb-2">City</th><th className="pb-2">Status</th><th className="pb-2">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {vendors.map(v => (
                <tr key={v._id} className="hover:bg-gray-50">
                  <td className="py-3 font-medium">{v.businessName}</td>
                  <td className="py-3 text-gray-500">{v.user?.name}</td>
                  <td className="py-3 text-gray-500">{v.address?.city || '—'}</td>
                  <td className="py-3">{v.isApproved ? <span className="badge-green">Approved</span> : <span className="badge-coral">Pending</span>}</td>
                  <td className="py-3">
                    {!v.isApproved && <button onClick={() => approveVendor(v._id)} className="text-xs px-3 py-1.5 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors">Approve</button>}
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-gray-400">No vendors yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
