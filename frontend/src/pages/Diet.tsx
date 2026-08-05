import { useState, useEffect } from 'react';
import { apiFetch, apiPost } from '../lib/api';

interface Props { user: any; dark: boolean; setPage: (page: string) => void; }

export default function Diet({ user, dark, setPage }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ memberId: '', name: '', targetCalories: 2000, proteinGrams: 150, carbsGrams: 200, fatGrams: 70 });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const isTrainer = user.role === 'PERSONAL_TRAINER' || user.role === 'FLOOR_TRAINER';
  const cardClass = dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200';
  const inputClass = dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';

  useEffect(() => {
    apiFetch('/diets/my').then(setData).catch(err => setError(err.message)).finally(() => setLoading(false));
    if (isTrainer) apiFetch('/trainers/my-clients').then(d => setClients(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault(); setSaving(true); setStatus('');
    try {
      await apiPost('/diets', { ...form, meals: [] });
      setStatus('✅ Diet plan created!'); setShowCreate(false); setForm({ memberId: '', name: '', targetCalories: 2000, proteinGrams: 150, carbsGrams: 200, fatGrams: 70 });
      apiFetch('/diets/my').then(setData);
    } catch (err: any) { setStatus(`❌ ${err.message}`); }
    setSaving(false);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{isTrainer ? 'Diet Plans' : 'My Diet Plan'}</h1>
        {isTrainer && <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium">{showCreate ? 'Cancel' : '+ Create Plan'}</button>}
      </div>

      {status && <p className={`mb-4 text-sm p-3 rounded-lg ${status.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{status}</p>}

      {showCreate && (
        <div className={`mb-6 p-5 border rounded-xl ${cardClass}`}>
          <h3 className="font-bold mb-3">Create Diet Plan</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Select Client *</label>
              <select value={form.memberId} onChange={e => setForm({...form, memberId: e.target.value})} required className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}>
                <option value="">Choose client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.user?.firstName} {c.user?.lastName} ({c.memberId})</option>)}
              </select>
            </div>
            <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Plan Name *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Fat Loss - 2000 kcal" className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Calories</label><input type="number" value={form.targetCalories} onChange={e => setForm({...form, targetCalories: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Protein (g)</label><input type="number" value={form.proteinGrams} onChange={e => setForm({...form, proteinGrams: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Carbs (g)</label><input type="number" value={form.carbsGrams} onChange={e => setForm({...form, carbsGrams: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Fat (g)</label><input type="number" value={form.fatGrams} onChange={e => setForm({...form, fatGrams: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
            </div>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">{saving ? 'Creating...' : 'Create Diet Plan'}</button>
          </form>
        </div>
      )}

      {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>}
      {error && <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg mb-4">{error}</div>}

      {!loading && isTrainer && Array.isArray(data) && data.length > 0 && (
        <div className="space-y-4">
          {data.map((plan: any) => (
            <div key={plan.id} className={`p-4 border rounded-xl ${cardClass}`}>
              <div className="flex justify-between items-start">
                <div><h3 className="font-bold">{plan.name}</h3><p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Client: {plan.member?.user?.firstName} {plan.member?.user?.lastName}</p></div>
                <div className="flex gap-2 items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{plan.isActive ? 'Active' : 'Inactive'}</span>
                  <button onClick={async () => { if (!confirm('Delete this diet plan?')) return; try { await fetch('/api/v1/diets/delete/' + plan.id, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); apiFetch('/diets/my').then(setData); } catch {} }} className="px-2 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                </div>
              </div>
              <div className={`text-sm mt-2 flex gap-4 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>{plan.targetCalories} kcal</span><span>P: {plan.proteinGrams}g</span><span>C: {plan.carbsGrams}g</span><span>F: {plan.fatGrams}g</span>
              </div>
              <p className={`text-xs mt-2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Created: {new Date(plan.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && isTrainer && (!data || (Array.isArray(data) && data.length === 0)) && !showCreate && (
        <p className={`text-center py-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>No diet plans created yet. Click "+ Create Plan" to start.</p>
      )}

      {!loading && !isTrainer && data && (
        <div className={`p-5 border rounded-xl ${cardClass}`}>
          <h3 className="font-bold">{data.name}</h3>
          <div className={`text-sm mt-2 flex gap-4 ${dark ? 'text-gray-400' : 'text-gray-600'}`}><span>{data.targetCalories} kcal</span><span>P: {data.proteinGrams}g</span><span>C: {data.carbsGrams}g</span><span>F: {data.fatGrams}g</span></div>
        </div>
      )}

      {!loading && !isTrainer && !data && <p className={`text-center py-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>No diet plan assigned yet.</p>}
    </div>
  );
}
