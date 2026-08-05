import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface Props { user: any; dark: boolean; setPage: (page: string) => void; }

export default function MyPackage({ user, dark, setPage }: Props) {
  const [subscription, setSubscription] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChange, setShowChange] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState('');

  const cardClass = dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200';

  useEffect(() => {
    apiFetch('/members/my-subscription').then(setSubscription).catch(() => {}).finally(() => setLoading(false));
    apiFetch('/packages').then(d => setPackages(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const daysLeft = subscription?.endDate ? Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const isExpired = daysLeft <= 0;

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>;

  return (
    <div className="p-4 md:p-6">
      <h1 className={`text-2xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>My Package</h1>

      {/* Current Subscription */}
      {subscription ? (
        <div className={`rounded-xl p-5 border mb-6 ${isExpired ? 'border-red-500' : 'border-green-500'} ${cardClass}`}>
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold">{subscription.package?.name || 'Active Plan'}</h2>
              <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{subscription.package?.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {isExpired ? 'Expired' : 'Active'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className={`p-3 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Price</p>
              <p className="font-bold text-green-500">₹{Number(subscription.package?.price || 0).toLocaleString()}</p>
            </div>
            <div className={`p-3 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Duration</p>
              <p className="font-bold">{subscription.package?.durationDays} days</p>
            </div>
            <div className={`p-3 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Start Date</p>
              <p className="font-bold">{new Date(subscription.startDate).toLocaleDateString()}</p>
            </div>
            <div className={`p-3 rounded-lg ${isExpired ? (dark ? 'bg-red-900/30' : 'bg-red-50') : (dark ? 'bg-gray-700' : 'bg-gray-50')}`}>
              <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Renewal Date</p>
              <p className={`font-bold ${isExpired ? 'text-red-500' : ''}`}>{new Date(subscription.endDate).toLocaleDateString()}</p>
              <p className={`text-xs ${isExpired ? 'text-red-400' : 'text-green-500'}`}>{isExpired ? 'Expired!' : `${daysLeft} days left`}</p>
            </div>
          </div>

          {subscription.package?.includesPersonalTrainer && (
            <p className="mt-3 text-sm text-purple-500">🏋️ Includes Personal Trainer ({subscription.package?.ptSessionsPerWeek}x/week)</p>
          )}

          <div className="flex gap-3 mt-4 flex-wrap">
            <button onClick={() => setShowPayment(true)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm">
              {isExpired ? '💳 Renew Now' : '💳 Pay Online'}
            </button>
            <button onClick={() => setShowChange(true)} className={`px-4 py-2 rounded-lg text-sm border ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
              🔄 Change Package
            </button>
          </div>
        </div>
      ) : (
        <div className={`rounded-xl p-5 border ${cardClass}`}>
          <p className={dark ? 'text-gray-400' : 'text-gray-500'}>No active subscription found. Contact your branch manager.</p>
        </div>
      )}

      {/* Branch Info */}
      {subscription?.branch && (
        <div className={`rounded-xl p-4 border mb-6 ${cardClass}`}>
          <h3 className="font-semibold mb-2">🏢 My Branch</h3>
          <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{subscription.branch.name}</p>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{subscription.branch.address}, {subscription.branch.city}</p>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>📞 {subscription.branch.phone}</p>
        </div>
      )}


      {/* GPay Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPayment(false)}>
          <div className={`w-full max-w-sm rounded-xl p-6 text-center ${dark ? 'bg-gray-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2">Pay Online</h3>
            <p className={`text-sm mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Scan the QR code below with Google Pay, PhonePe, or any UPI app</p>
            <div className={`p-6 rounded-xl mb-4 ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="w-48 h-48 mx-auto bg-white p-3 rounded-lg">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=fitness@upi%26pn=FitZone%26am=${subscription?.package?.price || 0}%26cu=INR%26tn=Gym-${subscription?.package?.name || 'Package'}`} alt="GPay QR" className="w-full h-full" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-500 mb-2">₹{Number(subscription?.package?.price || 0).toLocaleString()}</p>
            <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>UPI ID: fitness@upi</p>
            <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>After payment, share screenshot with branch manager for confirmation</p>
            <button onClick={async () => { try { await fetch('/api/v1/payments/record-online', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') }, body: JSON.stringify({ subscriptionId: subscription?.id, amount: Number(subscription?.package?.price || 0), method: 'GOOGLE_PAY' }) }); alert('✅ Payment recorded! Your branch manager will be notified.'); setShowPayment(false); } catch { alert('Payment recording failed. Share screenshot with manager.'); } }} className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg w-full hover:bg-green-600">I've Paid - Confirm Payment</button>
            <button onClick={() => setShowPayment(false)} className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg w-full">Close</button>
          </div>
        </div>
      )}

      {/* Change Package Modal */}
      {showChange && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowChange(false)}>
          <div className={`w-full max-w-lg rounded-xl p-6 max-h-[80vh] overflow-y-auto ${dark ? 'bg-gray-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Change Package</h3>
            <p className={`text-sm mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Select a new package. Contact your branch manager to finalize the switch.</p>
            <div className="space-y-3">
              {packages.map((pkg: any) => (
                <div key={pkg.id} onClick={() => setSelectedPkg(pkg.id)} className={`p-4 rounded-lg border cursor-pointer transition ${selectedPkg === pkg.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : (dark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300')}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{pkg.name}</p>
                      <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{pkg.description}</p>
                    </div>
                    <p className="text-lg font-bold text-green-500">₹{Number(pkg.price).toLocaleString()}</p>
                  </div>
                  <div className={`text-xs mt-2 flex gap-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <span>{pkg.durationDays} days</span>
                    {pkg.includesPersonalTrainer && <span className="text-purple-500">+ PT</span>}
                    {pkg.maxFreezeDays > 0 && <span>Freeze: {pkg.maxFreezeDays} days</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { if (selectedPkg) { alert('Package change request sent! Contact your branch manager to confirm.'); setShowChange(false); } }} disabled={!selectedPkg} className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">Request Change</button>
              <button onClick={() => setShowChange(false)} className={`flex-1 px-4 py-2 rounded-lg border ${dark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
