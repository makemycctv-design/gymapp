import { useState, useEffect } from 'react';
import { apiFetch, apiPost } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function CreateStaff({ user, dark, setPage }: Props) {
  const [branches, setBranches] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'BRANCH_MANAGER', branchId: '', specializations: '', certifications: '', bio: '', maxClients: 15 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editStaff, setEditStaff] = useState<any>(null);

  const fetchStaff = () => {
    setStaffLoading(true);
    apiFetch('/staff').then(data => setStaff(Array.isArray(data) ? data : [])).catch(() => {}).finally(() => setStaffLoading(false));
  };

  useEffect(() => {
    apiFetch('/branches').then(data => setBranches(Array.isArray(data) ? data : [])).catch(() => {});
    fetchStaff();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        specializations: form.specializations ? form.specializations.split(',').map(s => s.trim()).filter(Boolean) : [],
        certifications: form.certifications ? form.certifications.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      if (form.role === 'BRANCH_MANAGER') {
        const data = await apiPost('/staff/create-manager', payload);
        setCredentials(data);
      } else {
        const data = await apiPost('/trainers', payload);
        setCredentials(data);
      }
      setShowForm(false);
      fetchStaff();
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const deleteStaff = async (userId: string, name: string) => {
    if (!confirm(`Deactivate ${name}? They will no longer be able to login.`)) return;
    try {
      await fetch('/api/v1/staff/deactivate/' + userId, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' } });
      fetchStaff();
    } catch (err: any) { setError(err.message); }
  };

  const cardClass = dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200';
  const inputClass = dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';
  const isTrainerRole = form.role === 'PERSONAL_TRAINER' || form.role === 'FLOOR_TRAINER';

  // Credentials success screen
  if (credentials) {
    const creds = credentials.credentials || credentials;
    return (
      <div className="p-4 md:p-6 max-w-lg mx-auto">
        <div className={`p-6 border rounded-xl ${cardClass}`}>
          <h2 className="text-xl font-bold mb-4 text-green-500">Staff Created Successfully!</h2>
          <div className={`space-y-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
            <p><strong>Role:</strong> <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-sm">{form.role.replace(/_/g, ' ')}</span></p>
            <p><strong>Name:</strong> {form.firstName} {form.lastName}</p>
            <p><strong>Branch:</strong> {branches.find(b => b.id === form.branchId)?.name || 'N/A'}</p>
            <div className={`p-3 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className="font-medium mb-2">Login Credentials:</p>
              <p><strong>Email:</strong> <code className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-mono">{creds.email}</code></p>
              <p className="mt-1"><strong>Password:</strong> <code className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-mono text-lg font-bold">{creds.temporaryPassword}</code></p>
            </div>
          </div>
          <div className={`mt-4 p-3 rounded-lg ${dark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`text-sm font-medium ${dark ? 'text-yellow-400' : 'text-yellow-700'}`}>⚠️ Save & share these credentials!</p>
          </div>
          <div className="flex gap-3 mt-4 flex-wrap">
            <button onClick={() => { setCredentials(null); setForm({...form, firstName: '', lastName: '', email: '', phone: '' }); }} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Create Another</button>
            <button
              onClick={() => {
                const msg = `Welcome to FitZone Gym! 🏋️\n\nYour Staff Login Credentials:\n👔 Role: ${form.role.replace(/_/g, ' ')}\n📧 Email: ${creds.email || ''}\n🔑 Password: ${creds.temporaryPassword || ''}\n🏢 Branch: ${branches.find(b => b.id === form.branchId)?.name || ''}\n\n🔗 Login at: https://fitness.nokkoo.in\n\n⚠️ Please change your password on first login.`;
                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >📱 Share via WhatsApp</button>
            <button onClick={() => setPage('home')} className={`px-4 py-2 rounded-lg border ${dark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Staff Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm">{showForm ? 'Cancel' : '+ Create Staff'}</button>
      </div>

      {error && <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg mb-4">{error}</div>}

      {/* Create Form */}
      {showForm && (
        <div className={`mb-6 p-5 border rounded-xl ${cardClass}`}>
          <h3 className="font-bold mb-4">Create New Staff Member</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Role *</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`}>
                <option value="BRANCH_MANAGER">Branch Manager</option>
                <option value="PERSONAL_TRAINER">Personal Trainer</option>
                <option value="FLOOR_TRAINER">Floor Trainer</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Branch *</label>
              <select value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})} required className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`}>
                <option value="">Select Branch...</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>First Name *</label>
              <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Last Name *</label>
              <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Phone *</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required placeholder="+91..." className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            {isTrainerRole && (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Specializations</label>
                  <input value={form.specializations} onChange={e => setForm({...form, specializations: e.target.value})} placeholder="strength, cardio" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Certifications</label>
                  <input value={form.certifications} onChange={e => setForm({...form, certifications: e.target.value})} placeholder="ACE-CPT" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
                </div>
              </>
            )}
            <div className="md:col-span-2">
              <button type="submit" disabled={loading} className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50">{loading ? 'Creating...' : `Create ${form.role.replace(/_/g, ' ')}`}</button>
            </div>
          </form>
        </div>
      )}

      {/* Staff List */}
      <div className={`rounded-xl p-5 border ${cardClass}`}>
        <h3 className="font-semibold mb-4">All Staff ({staff.length})</h3>

        {staffLoading && <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div></div>}

        {!staffLoading && staff.length === 0 && (
          <p className={dark ? 'text-gray-400' : 'text-gray-500'}>No staff created yet. Click "+ Create Staff" to add managers and trainers.</p>
        )}

        {!staffLoading && staff.length > 0 && (
          <div className="space-y-3">
            {staff.map((s: any) => (
              <div key={s.id} className={`p-4 rounded-lg border flex items-center justify-between flex-wrap gap-3 ${dark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${s.role === 'BRANCH_MANAGER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {s.firstName?.[0]}{s.lastName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{s.firstName} {s.lastName}</p>
                    <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{s.email} • {s.phone}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.role === 'BRANCH_MANAGER' ? 'bg-blue-100 text-blue-700' : s.role === 'PERSONAL_TRAINER' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>
                        {s.role?.replace(/_/g, ' ')}
                      </span>
                      {s.branch && <span className={`px-2 py-0.5 rounded-full text-[10px] ${dark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>{s.branch.name}</span>}
                      {s.trainerProfile?.specializations?.length > 0 && s.trainerProfile.specializations.map((sp: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-700">{sp}</span>
                      ))}
                      {s.trainerProfile?.certifications?.length > 0 && s.trainerProfile.certifications.map((c: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-yellow-100 text-yellow-700">{c}</span>
                      ))}
                    </div>
                    {s.trainerProfile && (
                      <p className={`text-[10px] mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Clients: {s.trainerProfile.currentClients || 0}/{s.trainerProfile.maxClients || 15} • {s.trainerProfile.isAvailable ? '🟢 Available' : '🔴 Busy'}
                        {s.trainerProfile.bio && ` • ${s.trainerProfile.bio}`}
                      </p>
                    )}
                    {s.lastLoginAt && <p className={`text-[10px] ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Last login: {new Date(s.lastLoginAt).toLocaleDateString()}</p>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditStaff(s)} className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
                  <button onClick={() => deleteStaff(s.id, `${s.firstName} ${s.lastName}`)} className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Staff Modal */}
      {editStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditStaff(null)}>
          <div className={`w-full max-w-md rounded-xl p-6 ${dark ? 'bg-gray-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Edit Staff: {editStaff.firstName} {editStaff.lastName}</h3>
            <div className={`space-y-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <p><strong>Role:</strong> {editStaff.role?.replace(/_/g, ' ')}</p>
              <p><strong>Email:</strong> {editStaff.email}</p>
              <p><strong>Phone:</strong> {editStaff.phone}</p>
              <p><strong>Branch:</strong> {editStaff.branch?.name || 'N/A'}</p>
              <p><strong>Last Login:</strong> {editStaff.lastLoginAt ? new Date(editStaff.lastLoginAt).toLocaleString() : 'Never'}</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => deleteStaff(editStaff.id, `${editStaff.firstName} ${editStaff.lastName}`)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Deactivate</button>
              <button onClick={() => setEditStaff(null)} className={`flex-1 px-4 py-2 rounded-lg border ${dark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
