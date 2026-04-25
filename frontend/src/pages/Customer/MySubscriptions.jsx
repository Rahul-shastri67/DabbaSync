import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function MySubscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/subscriptions/my').then(({ data }) => setSubs(data.data)).finally(() => setLoading(false));
  }, []);

  const togglePause = async (sub) => {
    try {
      if (sub.status === 'active') {
        const from = new Date().toISOString().slice(0,10);
        const until = new Date(Date.now()+7*86400000).toISOString().slice(0,10);
        await api.put(`/subscriptions/${sub._id}/pause`, { pausedFrom: from, pausedUntil: until });
        toast.success('Subscription paused for 7 days');
      } else if (sub.status === 'paused') {
        await api.put(`/subscriptions/${sub._id}/resume`);
        toast.success('Subscription resumed!');
      }
      const { data } = await api.get('/subscriptions/my');
      setSubs(data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="p-4 space-y-4">{[1,2].map(i => <div key={i} className="card h-40 animate-pulse bg-gray-100" />)}</div>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">My Subscriptions</h1>
      {subs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium text-gray-700">No subscriptions yet</p>
          <Link to="/customer/browse" className="btn-primary inline-block mt-4 text-sm">Browse Plans</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {subs.map(sub => (
            <div key={sub._id} className="card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{sub.mealPlan?.name}</h3>
                  <p className="text-sm text-gray-500">{sub.vendor?.businessName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(sub.startDate)} → {formatDate(sub.endDate)}</p>
                </div>
                <span className={getStatusColor(sub.status)}>{sub.status}</span>
              </div>

              {/* Bill preview */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base ({sub.totalDays} days × {formatCurrency(sub.pricePerMeal)})</span>
                  <span>{formatCurrency(sub.baseBill)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-coral-600">{sub.skippedDays?.length || 0} skips deducted</span>
                  <span className="text-coral-600">−{formatCurrency((sub.skippedDays?.length || 0) * sub.pricePerMeal)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-1 mt-1">
                  <span>You Pay</span>
                  <span className="text-forest-600">{formatCurrency(sub.adjustedBill)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {['active','paused'].includes(sub.status) && (
                  <>
                    <Link to={`/customer/skip/${sub._id}`} className="btn-outline text-sm flex-1 text-center">Skip Days</Link>
                    <button onClick={() => togglePause(sub)} className="btn-outline text-sm flex-1">
                      {sub.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                  </>
                )}
                {sub.status === 'pending_payment' && (
                  <button className="btn-primary text-sm flex-1">Pay Now</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
