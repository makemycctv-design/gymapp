import { useState, useEffect } from 'react';
import { apiFetch, apiPost } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function CreateStaff({ user, dark, setPage }: Props) {
  const [branches, setBranches] = useState<any[]>([]);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'BRANCH_MANAGER', branchId: '', specializations: '', certifications: '', bio: '', maxClients: 15 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<any>(null);

  useEffect(() => {
    apiFetch('/branches').then(data => setBranches(Array.isArray(data) ? data : [])).catch(() => {});
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
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const cardClass = dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200';
  const inputClass = dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';
  const isTrainerRole = form.role === 'PERSONAL_TRAINER' || form.role === 'FLOOR_TRAINER';

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
            <p className={`text-xs mt-1 ${dark ? 'text-yellow-500' : 'text-yellow-600'}`}>The staff member uses this email + password to login. Password must be changed on first login.</p>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => { setCredentials(null); setForm({...form, firstName: '', lastName: '', email: '', phone: '' }); }} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Create Another</button>
            <button onClick={() => setPage('home')} className={`px-4 py-2 rounded-lg border ${dark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className={`text-2xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>Create Staff</h1>
      <p className={`mb-4 text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Create Branch Managers, Personal Trainers, or Floor Trainers and assign them to a branch.</p>

      {error && <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className={`p-5 border rounded-xl space-y-4 ${cardClass}`}>
        <div>
          <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Role *</label>
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`}>
            <option value="BRANCH_MANAGER">Branch Manager</option>
            <option value="PERSONAL_TRAINER">Personal Trainer</option>
            <option value="FLOOR_TRAINER">Floor Trainer</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Assign to Branch *</label>
          <select value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})} required className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`}>
            <option value="">Select Branch...</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>First Name *</label>
            <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Last Name *</label>
            <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="staff@gym.com" className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Phone *</label>
          <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required placeholder="+91..." className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
        </div>

        {isTrainerRole && (
          <>
            <div>
              <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Specializations</label>
              <input value={form.specializations} onChange={e => setForm({...form, specializations: e.target.value})} placeholder="strength, cardio, yoga" className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Certifications</label>
              <input value={form.certifications} onChange={e => setForm({...form, certifications: e.target.value})} placeholder="ACE-CPT, NASM" className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
          </>
        )}

        <button type="submit" disabled={loading} className="w-full px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50">{loading ? 'Creating...' : `Create ${form.role.replace(/_/g, ' ')}`}</button>
      </form>
    </div>
  );
}
