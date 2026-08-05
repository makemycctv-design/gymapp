import { useState, useEffect } from 'react';
import { apiFetch, apiPost } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function Branches({ user, dark, setPage }: Props) {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', address: '', city: '', state: '', zipCode: '', phone: '', email: '', latitude: 0, longitude: 0, geoFenceRadiusMeters: 50 });
  const [editBranch, setEditBranch] = useState<any>(null);
  const [editBranchForm, setEditBranchForm] = useState({ name: '', address: '', city: '', state: '', phone: '', email: '', geoFenceRadiusMeters: 50 });

  const fetchBranches = () => {
    setLoading(true);
    apiFetch('/branches')
      .then((data) => setBranches(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBranches(); }, []);

  const saveBranch = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiPost('/branches', form);
      setShowForm(false);
      setForm({ name: '', code: '', address: '', city: '', state: '', zipCode: '', phone: '', email: '', latitude: 0, longitude: 0, geoFenceRadiusMeters: 50 });
      fetchBranches();
    } catch (err: any) { setError(err.message); }
    setSaving(false);
  };

  const cardClass = dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200';
  const inputClass = dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';
  const isAdmin = user.role === 'SUPER_ADMIN';

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Branches</h1>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm">+ Add Branch</button>
        )}
      </div>

      {error && <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg mb-4">{error}</div>}

      {/* Add Branch Form */}
      {showForm && (
        <div className={`mb-6 p-5 border rounded-xl ${cardClass}`}>
          <h3 className="font-bold mb-4">New Branch</h3>
          <form onSubmit={saveBranch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Branch Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="FitZone - Location" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Code * (e.g. MUM-ANH)</label>
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} required placeholder="BLR-KOR" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Address *</label>
              <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} required placeholder="Full address" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>City *</label>
              <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} required placeholder="Mumbai" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>State *</label>
              <input value={form.state} onChange={e => setForm({...form, state: e.target.value})} required placeholder="Maharashtra" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Zip Code</label>
              <input value={form.zipCode} onChange={e => setForm({...form, zipCode: e.target.value})} placeholder="400001" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Phone *</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required placeholder="+91..." className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="branch@gym.com" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Geo-fence Radius (meters)</label>
              <input type="number" value={form.geoFenceRadiusMeters} onChange={e => setForm({...form, geoFenceRadiusMeters: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Create Branch'}</button>
              <button type="button" onClick={() => setShowForm(false)} className={`px-5 py-2 rounded-lg border ${dark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>}

      {!loading && branches.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch: any) => (
            <div key={branch.id} className={`p-5 border rounded-xl ${cardClass}`}>
              <h3 className="text-lg font-bold mb-2">{branch.name}</h3>
              <div className={`space-y-1 text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                <p><span className="font-medium">Code:</span> {branch.code}</p>
                <p><span className="font-medium">Address:</span> {branch.address}</p>
                <p><span className="font-medium">City:</span> {branch.city}, {branch.state}</p>
                <p><span className="font-medium">Phone:</span> {branch.phone}</p>
                <p><span className="font-medium">Geo-fence:</span> {branch.geoFenceRadiusMeters}m radius</p>
                {branch.latitude && <p className="text-xs font-mono">📍 {branch.latitude}, {branch.longitude}</p>}
              </div>
              {isAdmin && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button onClick={() => { setEditBranch(branch); setEditBranchForm({ name: branch.name, address: branch.address, city: branch.city, state: branch.state, phone: branch.phone, email: branch.email, geoFenceRadiusMeters: branch.geoFenceRadiusMeters }); }} className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
                  <button onClick={async () => { if (!confirm(`Delete branch "${branch.name}"? This cannot be undone.`)) return; try { await fetch('/api/v1/branches/delete/' + branch.id, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); fetchBranches(); } catch {} }} className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && branches.length === 0 && (
        <p className={`text-center py-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>No branches found.</p>
      )}

      {/* Edit Branch Modal */}
      {editBranch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditBranch(null)}>
          <div className={`w-full max-w-md rounded-xl p-6 ${dark ? 'bg-gray-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Edit Branch: {editBranch.name}</h3>
            <div className="space-y-3">
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Name</label><input value={editBranchForm.name} onChange={e => setEditBranchForm({...editBranchForm, name: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Address</label><input value={editBranchForm.address} onChange={e => setEditBranchForm({...editBranchForm, address: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>City</label><input value={editBranchForm.city} onChange={e => setEditBranchForm({...editBranchForm, city: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
                <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>State</label><input value={editBranchForm.state} onChange={e => setEditBranchForm({...editBranchForm, state: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              </div>
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label><input value={editBranchForm.phone} onChange={e => setEditBranchForm({...editBranchForm, phone: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Geo-fence Radius (m)</label><input type="number" value={editBranchForm.geoFenceRadiusMeters} onChange={e => setEditBranchForm({...editBranchForm, geoFenceRadiusMeters: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { /* TODO: save via API */ setEditBranch(null); }} className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Save</button>
              <button onClick={() => setEditBranch(null)} className={`flex-1 px-4 py-2 rounded-lg border ${dark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
