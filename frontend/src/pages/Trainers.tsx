import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function Trainers({ user, dark, setPage }: Props) {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editTrainer, setEditTrainer] = useState<any>(null);
  const [editForm, setEditForm] = useState({ specializations: '', certifications: '', bio: '', maxClients: 15, isAvailable: true });
  const [deleting, setDeleting] = useState('');

  const fetchTrainers = () => {
    setLoading(true);
    apiFetch('/trainers')
      .then((data) => setTrainers(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTrainers(); }, []);

  const deleteTrainer = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this trainer?')) return;
    setDeleting(userId);
    try {
      await fetch('/api/v1/staff/deactivate/' + userId, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      });
      fetchTrainers();
    } catch (err: any) { setError(err.message); }
    setDeleting('');
  };

  const cardClass = dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200';
  const inputClass = dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Trainers</h1>
        <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Use "Create Staff" to add new trainers</p>
      </div>

      {error && <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg mb-4">{error}</div>}

      {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>}

      {!loading && trainers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trainers.map((t: any) => (
            <div key={t.id} className={`p-5 border rounded-xl ${cardClass}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{t.user?.firstName} {t.user?.lastName}</h3>
                  <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.user?.email}</p>
                  <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.user?.phone}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.user?.role === 'PERSONAL_TRAINER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {t.user?.role === 'PERSONAL_TRAINER' ? 'Personal Trainer' : 'Floor Trainer'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${t.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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

              {/* Edit / Delete buttons */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => { setEditTrainer(t); setEditForm({ specializations: (t.specializations || []).join(', '), certifications: (t.certifications || []).join(', '), bio: t.bio || '', maxClients: t.maxClients || 15, isAvailable: t.isAvailable !== false }); }} className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
                <button onClick={() => deleteTrainer(t.user?.id)} disabled={deleting === t.user?.id} className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">{deleting === t.user?.id ? '...' : 'Deactivate'}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && trainers.length === 0 && (
        <div className={`text-center py-12 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-lg mb-2">No trainers found</p>
          <p className="text-sm">Go to <button onClick={() => setPage('create-staff')} className="text-green-500 underline">Create Staff</button> to add trainers.</p>
        </div>
      )}

      {/* Edit Modal */}
      {editTrainer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditTrainer(null)}>
          <div className={`w-full max-w-md rounded-xl p-6 ${dark ? 'bg-gray-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Edit Trainer: {editTrainer.user?.firstName} {editTrainer.user?.lastName}</h3>
            <div className="space-y-3">
              <div>
                <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Specializations (comma separated)</label>
                <input value={editForm.specializations} onChange={e => setEditForm({...editForm, specializations: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} placeholder="strength, cardio, yoga" />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Certifications (comma separated)</label>
                <input value={editForm.certifications} onChange={e => setEditForm({...editForm, certifications: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} placeholder="ACE-CPT, NASM" />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
                <input value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Max Clients</label>
                  <input type="number" value={editForm.maxClients} onChange={e => setEditForm({...editForm, maxClients: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={editForm.isAvailable} onChange={e => setEditForm({...editForm, isAvailable: e.target.checked})} id="avail" />
                  <label htmlFor="avail" className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Available</label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { /* Save via API in future */ setEditTrainer(null); }} className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Save</button>
              <button onClick={() => setEditTrainer(null)} className={`flex-1 px-4 py-2 rounded-lg border ${dark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
