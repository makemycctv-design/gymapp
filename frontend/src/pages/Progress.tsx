import { useState, useEffect } from 'react';
import { apiFetch, apiPost } from '../lib/api';

interface Props { user: any; dark: boolean; setPage: (page: string) => void; }

export default function Progress({ user, dark, setPage }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ memberId: '', weightKg: '', bodyFatPercentage: '', muscleMassKg: '', chestCm: '', waistCm: '', bicepsCm: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const isTrainer = user.role === 'PERSONAL_TRAINER' || user.role === 'FLOOR_TRAINER';
  const cardClass = dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200';
  const inputClass = dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';

  useEffect(() => {
    apiFetch('/measurements/my').then(d => setData(Array.isArray(d) ? d : [])).catch(err => setError(err.message)).finally(() => setLoading(false));
    if (isTrainer) apiFetch('/trainers/my-clients').then(d => setClients(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault(); setSaving(true); setStatus('');
    try {
      await apiPost('/measurements', { memberId: form.memberId, weightKg: Number(form.weightKg) || null, bodyFatPercentage: Number(form.bodyFatPercentage) || null, muscleMassKg: Number(form.muscleMassKg) || null, chestCm: Number(form.chestCm) || null, waistCm: Number(form.waistCm) || null, bicepsCm: Number(form.bicepsCm) || null, notes: form.notes });
      setStatus('✅ Measurement recorded!'); setShowCreate(false);
      setForm({ memberId: '', weightKg: '', bodyFatPercentage: '', muscleMassKg: '', chestCm: '', waistCm: '', bicepsCm: '', notes: '' });
      apiFetch('/measurements/my').then(d => setData(Array.isArray(d) ? d : []));
    } catch (err: any) { setStatus(`❌ ${err.message}`); }
    setSaving(false);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{isTrainer ? 'Measurements' : 'My Progress'}</h1>
        {isTrainer && <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium">{showCreate ? 'Cancel' : '+ Record'}</button>}
      </div>

      {status && <p className={`mb-4 text-sm p-3 rounded-lg ${status.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{status}</p>}


      {showCreate && (
        <div className={`mb-6 p-5 border rounded-xl ${cardClass}`}>
          <h3 className="font-bold mb-3">Record Measurement</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Select Client *</label>
              <select value={form.memberId} onChange={e => setForm({...form, memberId: e.target.value})} required className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}>
                <option value="">Choose client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.user?.firstName} {c.user?.lastName}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Weight (kg)</label><input type="number" step="0.1" value={form.weightKg} onChange={e => setForm({...form, weightKg: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Body Fat %</label><input type="number" step="0.1" value={form.bodyFatPercentage} onChange={e => setForm({...form, bodyFatPercentage: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Muscle (kg)</label><input type="number" step="0.1" value={form.muscleMassKg} onChange={e => setForm({...form, muscleMassKg: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Chest (cm)</label><input type="number" step="0.1" value={form.chestCm} onChange={e => setForm({...form, chestCm: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Waist (cm)</label><input type="number" step="0.1" value={form.waistCm} onChange={e => setForm({...form, waistCm: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Biceps (cm)</label><input type="number" step="0.1" value={form.bicepsCm} onChange={e => setForm({...form, bicepsCm: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
            </div>
            <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Notes</label><input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Observations..." className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">{saving ? 'Saving...' : 'Record'}</button>
          </form>
        </div>
      )}

      {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>}
      {error && <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg mb-4">{error}</div>}

      {!loading && data.length > 0 && (
        <div className={`border rounded-xl overflow-hidden ${cardClass}`}>
          <table className="w-full text-sm">
            <thead><tr className={`border-b ${dark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
              {isTrainer && <th className="text-left py-2 px-3">Client</th>}
              <th className="text-left py-2 px-3">Date</th><th className="text-left py-2 px-3">Weight</th><th className="text-left py-2 px-3">Fat%</th><th className="text-left py-2 px-3">Muscle</th><th className="text-left py-2 px-3">Waist</th>
              {isTrainer && <th className="text-left py-2 px-3"></th>}
            </tr></thead>
            <tbody>
              {data.map((m: any, i: number) => (
                <tr key={m.id || i} className={`border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                  {isTrainer && <td className="py-2 px-3">{m.member?.user?.firstName} {m.member?.user?.lastName}</td>}
                  <td className="py-2 px-3">{m.date ? new Date(m.date).toLocaleDateString() : '-'}</td>
                  <td className="py-2 px-3">{m.weightKg || '-'} kg</td>
                  <td className="py-2 px-3">{m.bodyFatPercentage || '-'}%</td>
                  <td className="py-2 px-3">{m.muscleMassKg || '-'} kg</td>
                  <td className="py-2 px-3">{m.waistCm || '-'} cm</td>
                  {isTrainer && <td className="py-2 px-3"><button onClick={async () => { if (!confirm('Delete this measurement?')) return; try { await fetch('/api/v1/measurements/delete/' + m.id, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); apiFetch('/measurements/my').then(d => setData(Array.isArray(d) ? d : [])); } catch {} }} className="px-2 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600">Del</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && data.length === 0 && !showCreate && (
        <p className={`text-center py-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{isTrainer ? 'No measurements recorded yet. Click "+ Record" to start.' : 'No measurements recorded yet.'}</p>
      )}
    </div>
  );
}
