import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../utils/socket';
import { formatCurrency, getMealEmoji, getStatusColor, countdown } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MEAL_LABEL = { breakfast:'Breakfast', lunch:'Lunch', dinner:'Dinner' };

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders]     = useState([]);
  const [notifs, setNotifs]     = useState([]);
  const [timers, setTimers]     = useState({});
  const [loading, setLoading]   = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, notifsRes] = await Promise.all([
        api.get('/orders/today'),
        api.get('/customer/notifications')
      ]);
      setOrders(ordersRes.data.data);
      setNotifs(notifsRes.data.data.slice(0,5));
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Live order status via socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = ({ orderId, status }) => {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      toast(`Meal status updated: ${status.replace(/_/g,' ')}`, { icon: '🍱' });
    };
    socket.on('order_status', handler);
    return () => socket.off('order_status', handler);
  }, []);

  // Cancellation countdown ticks
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = {};
      orders.forEach(o => {
        if (o.isCancelable && o.scheduledAt) {
          const cutoff = new Date(o.scheduledAt).getTime() - 3600000;
          const diff = cutoff - Date.now();
          if (diff > 0) {
            const h = Math.floor(diff/3600000);
            const m = Math.floor((diff%3600000)/60000);
            const s = Math.floor((diff%60000)/1000);
            updated[o._id] = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
          }
        }
      });
      setTimers(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [orders]);

  const cancelOrder = async (id) => {
    try {
      await api.put(`/orders/${id}/cancel`, { reason: 'Customer cancelled' });
      toast.success('Order cancelled. Refund added to wallet.');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}</div>;

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-sm text-gray-500">{greeting()}</p>
          <h1 className="text-xl font-bold text-gray-900">{user?.name?.split(' ')[0]} 👋</h1>
        </div>
        <Link to="/customer/browse" className="btn-primary text-sm px-4 py-2">+ Subscribe</Link>
      </div>

      {/* Notifications */}
      {notifs.filter(n => !n.isRead).length > 0 && (
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 space-y-2">
          {notifs.filter(n => !n.isRead).slice(0,2).map(n => (
            <div key={n._id} className="flex items-start gap-3">
              <span className="text-lg">🔔</span>
              <div>
                <p className="text-sm font-medium text-brand-800">{n.title}</p>
                <p className="text-xs text-brand-600">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Today's Meals */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Today's Tiffin</h2>
        {orders.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-4xl mb-3">🍱</p>
            <p className="font-medium text-gray-700">No meals today</p>
            <p className="text-sm text-gray-400 mt-1">Subscribe to a plan to get started</p>
            <Link to="/customer/browse" className="btn-primary inline-block mt-4 text-sm">Browse Plans</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order._id} className={`card border-l-4 ${order.status === 'delivered' ? 'border-l-green-400' : order.status === 'out_for_delivery' ? 'border-l-brand-500' : 'border-l-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMealEmoji(order.mealType)}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{MEAL_LABEL[order.mealType]}</p>
                      <p className="text-xs text-gray-500">{order.vendor?.businessName}</p>
                    </div>
                  </div>
                  <span className={getStatusColor(order.status)}>
                    {order.status.replace(/_/g,' ')}
                  </span>
                </div>

                {/* Progress bar for active deliveries */}
                {['preparing','out_for_delivery'].includes(order.status) && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Placed ✓</span><span>Preparing {order.status === 'out_for_delivery' ? '✓' : ''}</span>
                      <span>On the way {order.status === 'out_for_delivery' ? '⟳' : ''}</span><span>Delivered</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className={`h-full rounded-full bg-brand-500 transition-all ${order.status === 'preparing' ? 'w-2/4' : 'w-3/4'}`} />
                    </div>
                  </div>
                )}

                {/* Cancellation countdown */}
                {order.isCancelable && timers[order._id] && (
                  <div className="bg-coral-100 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-coral-600">Cancel window closes in</p>
                      <p className="font-mono text-lg font-bold text-coral-600">{timers[order._id]}</p>
                    </div>
                    <button onClick={() => cancelOrder(order._id)} className="btn-outline text-xs px-3 py-1.5 border-coral-300 text-coral-600 hover:bg-coral-100">Cancel</button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <span>Scheduled: {new Date(order.scheduledAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</span>
                  <span className="font-medium text-gray-700">{formatCurrency(order.amount)}</span>
                </div>

                {order.status === 'delivered' && !order.rating?.stars && (
                  <Link to={`/customer/track/${order._id}`} className="mt-2 text-xs text-brand-600 font-medium block">⭐ Rate this meal</Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/customer/subscriptions" className="card text-center py-5 hover:shadow-md transition-shadow">
          <p className="text-2xl mb-1">📋</p>
          <p className="text-sm font-medium text-gray-700">My Plans</p>
        </Link>
        <Link to="/customer/wallet" className="card text-center py-5 hover:shadow-md transition-shadow">
          <p className="text-2xl mb-1">💰</p>
          <p className="text-sm font-medium text-gray-700">Wallet</p>
        </Link>
      </div>
    </div>
  );
}
