import { useState, useEffect } from 'react';
import { apiFetch, apiPost } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function Packages({ user, dark, setPage }: Props) {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editPkg, setEditPkg] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', durationDays: 30, price: 0, includesPersonalTrainer: false, ptSessionsPerWeek: 0, maxFreezeDays: 0 });
  const [saving, setSaving] = useState(false);

  const fetchPackages = () => {
    setLoading(true);
    apiFetch('/packages')
      .then((data) => setPackages(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPackages(); }, []);

  const openAdd = () => {
    setEditPkg(null);
    setForm({ name: '', description: '', durationDays: 30, price: 0, includesPersonalTrainer: false, ptSessionsPerWeek: 0, maxFreezeDays: 0 });
    setShowForm(true);
  };

  const openEdit = (pkg: any) => {
    setEditPkg(pkg);
    setForm({ name: pkg.name, description: pkg.description || '', durationDays: pkg.durationDays, price: Number(pkg.price), includesPersonalTrainer: pkg.includesPersonalTrainer || false, ptSessionsPerWeek: pkg.ptSessionsPerWeek || 0, maxFreezeDays: pkg.maxFreezeDays || 0 });
    setShowForm(true);
  };

  const savePackage = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPost('/packages', { ...form, sortOrder: packages.length + 1 });
      setShowForm(false);
      fetchPackages();
    } catch (err: any) { setError(err.message); }
    setSaving(false);
  };

  const cardClass = dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200';
  const inputClass = dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';
  const isManager = user.role === 'BRANCH_MANAGER' || user.role === 'SUPER_ADMIN';

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Packages</h1>
        {isManager && (
          <button onClick={openAdd} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm">+ Add Package</button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className={`mb-6 p-5 border rounded-xl ${cardClass}`}>
          <h3 className="font-bold mb-4">{editPkg ? 'Edit Package' : 'New Package'}</h3>
          <form onSubmit={savePackage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} placeholder="e.g. Gold - 6 Months" />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} required className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Duration (days) *</label>
              <input type="number" value={form.durationDays} onChange={e => setForm({...form, durationDays: Number(e.target.value)})} required className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Max Freeze Days</label>
              <input type="number" value={form.maxFreezeDays} onChange={e => setForm({...form, maxFreezeDays: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} placeholder="Package description..." />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={form.includesPersonalTrainer} onChange={e => setForm({...form, includesPersonalTrainer: e.target.checked})} id="pt" className="w-4 h-4" />
              <label htmlFor="pt" className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Includes Personal Trainer</label>
            </div>
            {form.includesPersonalTrainer && (
              <div>
                <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>PT Sessions/Week</label>
                <input type="number" value={form.ptSessionsPerWeek} onChange={e => setForm({...form, ptSessionsPerWeek: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${inputClass}`} />
              </div>
            )}
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save Package'}</button>
              <button type="button" onClick={() => setShowForm(false)} className={`px-5 py-2 rounded-lg border ${dark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>}
      {error && <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg mb-4">{error}</div>}

      {!loading && !error && packages.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg: any) => (
            <div key={pkg.id} className={`p-5 border rounded-xl hover:shadow-md transition ${cardClass}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg">{pkg.name}</h3>
                {pkg.includesPersonalTrainer && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">PT</span>}
              </div>
              <p className={`text-sm mb-3 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{pkg.description}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-500">₹{Number(pkg.price).toLocaleString()}</p>
                  <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{pkg.durationDays} days</p>
                </div>
                {isManager && (
                  <button onClick={() => openEdit(pkg)} className={`text-sm px-3 py-1.5 rounded-lg border ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>Edit</button>
                )}
              </div>
              {pkg.maxFreezeDays > 0 && <p className={`text-xs mt-2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Freeze: {pkg.maxFreezeDays} days</p>}
              {pkg.ptSessionsPerWeek && <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>PT: {pkg.ptSessionsPerWeek}x/week</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
