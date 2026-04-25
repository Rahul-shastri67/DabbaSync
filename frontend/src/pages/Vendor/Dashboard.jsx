import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../utils/socket';
import { formatCurrency } from '../../utils/helpers';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [dashRes, analyticsRes] = await Promise.all([
        api.get('/vendor/dashboard'),
        api.get('/vendor/analytics?days=7')
      ]);
      setData(dashRes.data.data);
      const rm = analyticsRes.data.data.revenueMap;
      setRevenueData(Object.entries(rm).map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString('en-IN',{weekday:'short'}), revenue
      })));
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboard(); }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on('skip_update', ({ customerName, skippedDates, newCount }) => {
      toast(`${customerName} skipped ${skippedDates.length} meal(s). Active meals: ${newCount}`, { icon: '⚠️', duration: 5000 });
      fetchDashboard();
    });
    socket.on('order_cancelled', () => fetchDashboard());
    return () => { socket.off('skip_update'); socket.off('order_cancelled'); };
  }, []);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="card h-24 animate-pulse bg-gray-100"/>)}</div>;

  const { activeMeals, activeSubs, skippedToday, weeklyRevenue, statusBreakdown, todayOrders } = data || {};

  const stats = [
    { label: 'Meals Today',     value: activeMeals || 0,   color: 'text-brand-600',  bg: 'bg-brand-50' },
    { label: 'Weekly Revenue',  value: formatCurrency(weeklyRevenue || 0), color: 'text-forest-600', bg: 'bg-forest-100' },
    { label: 'Active Subs',     value: activeSubs || 0,    color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Skipped Today',   value: skippedToday || 0,  color: 'text-coral-600',  bg: 'bg-coral-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Control Tower</h1>
        <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`card ${s.bg} border-0`}>
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="card">
          <h3 className="font-semibold mb-4">Today's Delivery Status</h3>
          <div className="space-y-3">
            {Object.entries(statusBreakdown || {}).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 capitalize">{status.replace(/_/g,' ')}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full rounded-full bg-brand-400 transition-all"
                    style={{ width: `${activeMeals > 0 ? (count/activeMeals*100).toFixed(0) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue chart */}
        <div className="card">
          <h3 className="font-semibold mb-4">7-Day Revenue</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${Math.round(v/1000)}k`} />
              <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#EF9F27" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's Orders */}
      <div className="card">
        <h3 className="font-semibold mb-4">Today's Orders ({todayOrders?.length || 0})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Meal</th>
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Cancelable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(todayOrders || []).slice(0,10).map(o => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="py-2.5 font-medium">{o.customer?.name}</td>
                  <td className="py-2.5 capitalize text-gray-500">{o.mealType}</td>
                  <td className="py-2.5 text-gray-500">{new Date(o.scheduledAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</td>
                  <td className="py-2.5">
                    <span className={`badge-${o.status === 'delivered' ? 'green' : o.status === 'skipped' || o.status === 'cancelled' ? 'coral' : 'amber'}`}>
                      {o.status.replace(/_/g,' ')}
                    </span>
                  </td>
                  <td className="py-2.5">{o.isCancelable ? <span className="badge-amber">Open</span> : <span className="badge-gray">Locked</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
