import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({});
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get('/customer/wallet').then(({ data }) => setWallet(data.data));
    api.get('/payments/history').then(({ data }) => setPayments(data.data));
  }, []);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-5">
      <h1 className="text-xl font-bold">Wallet & Credits</h1>

      <div className="card bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <p className="text-sm opacity-80 mb-1">Available Balance</p>
        <p className="text-4xl font-bold">{formatCurrency(wallet.wallet || 0)}</p>
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div><p className="opacity-70">Loyalty Points</p><p className="font-semibold">{wallet.loyaltyPoints || 0} pts</p></div>
          <div><p className="opacity-70">Referral Code</p><p className="font-mono font-semibold">{wallet.referralCode || '—'}</p></div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Refer & Earn</h3>
        <p className="text-sm text-gray-500 mb-3">Share your code — earn ₹200 per referral!</p>
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 flex items-center justify-between">
          <span className="font-mono font-semibold text-brand-700">{wallet.referralCode || '...'}</span>
          <button onClick={() => { navigator.clipboard.writeText(wallet.referralCode || ''); toast.success('Copied!'); }}
            className="text-xs text-brand-600 font-medium">Copy</button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Transaction History</h3>
        {payments.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No transactions yet</p> : (
          <div className="space-y-3">
            {payments.map(p => (
              <div key={p._id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.description || p.type.replace(/_/g,' ')}</p>
                  <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                </div>
                <span className={`font-semibold text-sm ${p.type === 'refund' ? 'text-forest-600' : 'text-gray-900'}`}>
                  {p.type === 'refund' ? '+' : ''}{formatCurrency(p.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
