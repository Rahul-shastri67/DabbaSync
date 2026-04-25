import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STEPS = ['scheduled','preparing','out_for_delivery','delivered'];
const STEP_LABEL = { scheduled:'Order Placed', preparing:'Preparing', out_for_delivery:'On the Way', delivered:'Delivered' };
const STEP_ICON  = { scheduled:'📋', preparing:'👨‍🍳', out_for_delivery:'🛵', delivered:'✅' };

export default function TrackOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [star, setStar] = useState(0);
  const [review, setReview] = useState('');
  const [rated, setRated] = useState(false);

  useEffect(() => {
    api.get('/orders/today').then(({ data }) => {
      const o = data.data.find(o => o._id === id);
      if (o) { setOrder(o); if (o.rating?.stars) { setStar(o.rating.stars); setRated(true); } }
    });
  }, [id]);

  const submitRating = async () => {
    if (!star) return toast.error('Choose a star rating');
    try {
      await api.put(`/orders/${id}/rate`, { stars: star, review });
      toast.success('Thanks for your feedback!');
      setRated(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (!order) return <div className="p-6 card animate-pulse h-64" />;

  const stepIdx = STEPS.indexOf(order.status);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500">← Back</button>
      <h1 className="text-xl font-bold">Track Delivery</h1>

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold">{order.mealType?.charAt(0).toUpperCase()+order.mealType?.slice(1)} Tiffin</h3>
            <p className="text-sm text-gray-500">{order.vendor?.businessName}</p>
          </div>
          <span className="text-3xl">{order.mealType === 'breakfast' ? '🌅' : order.mealType === 'dinner' ? '🌙' : '🍱'}</span>
        </div>

        {/* Step tracker */}
        <div className="space-y-4">
          {STEPS.map((step, idx) => {
            const done    = idx <= stepIdx;
            const current = idx === stepIdx;
            return (
              <div key={step} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all
                  ${done ? (current ? 'bg-brand-500 shadow-lg shadow-brand-200' : 'bg-forest-100') : 'bg-gray-100'}`}>
                  {STEP_ICON[step]}
                </div>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${done ? 'text-gray-900' : 'text-gray-400'}`}>{STEP_LABEL[step]}</p>
                  {current && <p className="text-xs text-brand-600 font-medium">In progress...</p>}
                </div>
                {done && !current && <span className="text-forest-500 text-sm">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rating */}
      {order.status === 'delivered' && (
        <div className="card">
          <h3 className="font-semibold mb-3">{rated ? 'Your Rating' : 'Rate this meal'}</h3>
          <div className="flex gap-2 mb-3">
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => !rated && setStar(s)} disabled={rated}
                className={`text-3xl transition-transform ${s <= star ? 'text-brand-500' : 'text-gray-200'} ${!rated ? 'hover:scale-110' : ''}`}>
                ★
              </button>
            ))}
          </div>
          {!rated && (
            <>
              <textarea className="input text-sm resize-none" rows={2} placeholder="Tell us about the food..." value={review} onChange={e => setReview(e.target.value)} />
              <button onClick={submitRating} className="btn-primary w-full mt-3 text-sm">Submit Rating</button>
            </>
          )}
          {rated && <p className="text-sm text-forest-600">Thanks for your feedback! ✅</p>}
        </div>
      )}
    </div>
  );
}
