import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUSES = ['scheduled','preparing','out_for_delivery','delivered','skipped','cancelled'];

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState({ status:'', date: new Date().toISOString().slice(0,10) });
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { date: filter.date };
      if (filter.status) params.status = filter.status;
      const { data } = await api.get('/vendor/orders', { params });
      setOrders(data.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch { toast.error('Failed to update'); }
  };

  const nextStatus = (s) => ({
    scheduled: 'preparing', preparing: 'out_for_delivery', out_for_delivery: 'delivered'
  }[s]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>

      <div className="flex gap-3 flex-wrap">
        <input type="date" className="input w-48" value={filter.date} onChange={e => setFilter(f => ({ ...f, date: e.target.value }))} />
        <select className="input w-44" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="card h-16 animate-pulse bg-gray-100" />)}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Meal</th>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Cancelable</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(o => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="py-3 font-medium">{o.customer?.name}</td>
                  <td className="py-3 text-gray-500">{o.customer?.phone}</td>
                  <td className="py-3 capitalize text-gray-500">{o.mealType}</td>
                  <td className="py-3 text-gray-500">{new Date(o.scheduledAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</td>
                  <td className="py-3">
                    <span className={`badge-${o.status==='delivered'?'green':o.status==='skipped'||o.status==='cancelled'?'coral':'amber'}`}>
                      {o.status.replace(/_/g,' ')}
                    </span>
                  </td>
                  <td className="py-3">{o.isCancelable ? <span className="badge-amber text-xs">Open</span> : <span className="badge-gray text-xs">Locked</span>}</td>
                  <td className="py-3">
                    {nextStatus(o.status) && (
                      <button onClick={() => updateStatus(o._id, nextStatus(o.status))}
                        className="text-xs px-3 py-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
                        → {nextStatus(o.status).replace(/_/g,' ')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center text-gray-400 py-8">No orders found</p>}
        </div>
      )}
    </div>
  );
}
