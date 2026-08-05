import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface Props { user: any; dark: boolean; setPage: (page: string) => void; }

export default function Payments({ user, dark, setPage }: Props) {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState<'gpay' | 'cash' | null>(null);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [cashStatus, setCashStatus] = useState('');
  const cardClass = dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200';

  useEffect(() => {
    apiFetch('/payments/subscriptions').then(d => setSubscriptions(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getDaysLeft = (endDate: string) => Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="p-4 md:p-6">
      <h1 className={`text-2xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>Payments & Subscriptions</h1>

      {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>}

      {!loading && subscriptions.length === 0 && (
        <p className={`text-center py-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>No subscription data found.</p>
      )}

      {!loading && subscriptions.length > 0 && (
        <div className={`border rounded-xl overflow-hidden ${cardClass}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${dark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                  <th className="text-left py-3 px-4">Member</th>
                  <th className="text-left py-3 px-4">Package</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Start</th>
                  <th className="text-left py-3 px-4">Renewal</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Days Left</th>
                  <th className="text-left py-3 px-4">Payment</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub: any) => {
                  const days = getDaysLeft(sub.endDate);
                  const isExpired = days <= 0;
                  const isExpiring = days > 0 && days <= 7;
                  return (
                    <tr key={sub.id} className={`border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className="py-3 px-4">
                        <p className="font-medium">{sub.member?.user?.firstName} {sub.member?.user?.lastName}</p>
                        <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{sub.member?.memberId}</p>
                      </td>
                      <td className="py-3 px-4">{sub.package?.name}</td>
                      <td className="py-3 px-4 font-semibold text-green-500">₹{Number(sub.package?.price || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">{new Date(sub.startDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{new Date(sub.endDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          isExpired ? 'bg-red-100 text-red-700' : sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>{isExpired ? 'Expired' : sub.status}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${isExpired ? 'text-red-500' : isExpiring ? 'text-yellow-500' : 'text-green-500'}`}>
                          {isExpired ? 'Expired' : `${days} days`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <button onClick={() => { setSelectedSub(sub); setShowPayment('gpay'); }} className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">GPay</button>
                          <button onClick={() => { setSelectedSub(sub); setShowPayment('cash'); }} className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Cash</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {!loading && subscriptions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className={`p-4 rounded-xl border ${cardClass}`}>
            <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Total Members</p>
            <p className="text-xl font-bold">{subscriptions.length}</p>
          </div>
          <div className={`p-4 rounded-xl border ${cardClass}`}>
            <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Active</p>
            <p className="text-xl font-bold text-green-500">{subscriptions.filter(s => getDaysLeft(s.endDate) > 0).length}</p>
          </div>
          <div className={`p-4 rounded-xl border ${cardClass}`}>
            <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Expiring (7 days)</p>
            <p className="text-xl font-bold text-yellow-500">{subscriptions.filter(s => { const d = getDaysLeft(s.endDate); return d > 0 && d <= 7; }).length}</p>
          </div>
          <div className={`p-4 rounded-xl border ${cardClass}`}>
            <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Expired</p>
            <p className="text-xl font-bold text-red-500">{subscriptions.filter(s => getDaysLeft(s.endDate) <= 0).length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
