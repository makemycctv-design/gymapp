import { useState, useEffect } from 'react';
import { apiFetch, apiPost } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function Trainers({ user, dark, setPage }: Props) {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'PERSONAL_TRAINER', specializations: '', certifications: '', bio: '', maxClients: 15 });

  const fetchTrainers = () => {
    setLoading(true);
    apiFetch('/trainers')
      .then((data) => setTrainers(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTrainers(); }, []);

  const saveTrainer = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        specializations: form.specializations.split(',').map(s => s.trim()).filter(Boolean),
        certifications: form.certifications.split(',').map(s => s.trim()).filter(Boolean),
      };
      const data = await apiPost('/trainers', payload);
      setCredentials(data.credentials);
      setShowForm(false);
      fetchTrainers();
    } catch (err: any) { setError(err.message); }
    setSaving(false);
  };

  const cardClass = dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200';
  const inputClass = dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';
  const isManager = user.role === 'BRANCH_MANAGER' || user.role === 'SUPER_ADMIN';

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Trainers</h1>
        {isManager && (
          <button onClick={() => { setShowForm(!showForm); setCredentials(null); }} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm">+ Add Trainer</button>
        )}
      </div>

      {error && <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg mb-4">{error}</div>}

      {/* Credentials display */}
      {credentials && (
        <div className={`mb-6 p-5 border rounded-xl border-green-500 ${dark ? 'bg-green-900/20' : 'bg-green-50'}`}>
          <h3 className="font-bold text-green-500 mb-2">Trainer Created! Credentials:</h3>
          <p className={dark ? 'text-gray-300' : 'text-gray-700'}><strong>Email:</strong> {credentials.email}</p>
          <p className={dark ? 'text-gray-300' : 'text-gray-700'}><strong>Temporary Password:</strong> <code className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">{credentials.temporaryPassword}</code></p>
          <p className={`text-sm mt-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Share these with the trainer. They must change password on first login.</p>
          <button onClick={() => setCredentials(null)} className="mt-2 text-sm text-green-500 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Add Trainer Form */}
      {showForm && (
        <div className={`mb-6 p-5 border rounded-xl ${cardClass}`}>
          <h3 className="font-bold mb-4">New Trainer</h3>
          <form onSubmit={saveTrainer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>First Name *</label>
              <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Last Name *</label>
              <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Phone *</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required placeholder="+91..." className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Role *</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`}>
                <option value="PERSONAL_TRAINER">Personal Trainer</option>
                <option value="FLOOR_TRAINER">Floor Trainer</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Max Clients</label>
              <input type="number" value={form.maxClients} onChange={e => setForm({...form, maxClients: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Specializations (comma separated)</label>
              <input value={form.specializations} onChange={e => setForm({...form, specializations: e.target.value})} placeholder="strength, cardio, yoga" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Certifications (comma separated)</label>
              <input value={form.certifications} onChange={e => setForm({...form, certifications: e.target.value})} placeholder="ACE-CPT, NASM" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
              <input value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Brief trainer bio..." className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50">{saving ? 'Creating...' : 'Create Trainer'}</button>
              <button type="button" onClick={() => setShowForm(false)} className={`px-5 py-2 rounded-lg border ${dark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>}

      {!loading && trainers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trainers.map((t: any) => (
            <div key={t.id} className={`p-5 border rounded-xl ${cardClass}`}>
              <h3 className="text-lg font-bold">{t.user?.firstName} {t.user?.lastName}</h3>
              <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.user?.email}</p>
              <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.user?.phone}</p>
              <div className="mt-3">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${t.user?.role === 'PERSONAL_TRAINER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {t.user?.role === 'PERSONAL_TRAINER' ? 'Personal Trainer' : 'Floor Trainer'}
                </span>
                <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs ${t.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {t.isAvailable ? 'Available' : 'Busy'}
                </span>
              </div>
              {t.specializations && t.specializations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {t.specializations.map((s: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">{s}</span>
                  ))}
                </div>
              )}
              {t.certifications && t.certifications.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {t.certifications.map((c: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">{c}</span>
                  ))}
                </div>
              )}
              <p className={`text-xs mt-2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Clients: {t.currentClients}/{t.maxClients}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && trainers.length === 0 && !showForm && (
        <p className={`text-center py-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>No trainers found. Click "+ Add Trainer" to create one.</p>
      )}
    </div>
  );
}
