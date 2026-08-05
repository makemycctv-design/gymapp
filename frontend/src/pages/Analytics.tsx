import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function Analytics({ user, dark, setPage }: Props) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');

  const fetchAnalytics = (branchId?: string) => {
    setLoading(true);
    const url = branchId ? `/analytics/dashboard?branchId=${branchId}` : '/analytics/dashboard';
    apiFetch(url).then((data) => setStats(data)).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
    if (user.role === 'SUPER_ADMIN') apiFetch('/branches').then(d => setBranches(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const cardClass = dark
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Analytics Dashboard</h1>
        {user.role === 'SUPER_ADMIN' && branches.length > 0 && (
          <select value={selectedBranch} onChange={e => { setSelectedBranch(e.target.value); fetchAnalytics(e.target.value || undefined); }} className={`px-3 py-2 border rounded-lg text-sm ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
            <option value="">All Branches</option>
            {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>


      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg mb-4">
          {error}
        </div>
      )}

      {!loading && !error && stats && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Object.entries(stats).map(([key, value]: [string, any]) => {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              return Object.entries(value).map(([subKey, subVal]: [string, any]) => (
                <div key={`${key}-${subKey}`} className={`p-6 border rounded-xl ${cardClass}`}>
                  <p className={`text-sm font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {subKey.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {typeof subVal === 'number' ? subVal.toLocaleString() : String(subVal)}
                  </p>
                </div>
              ));
            }
            if (Array.isArray(value)) return null;
            return (
              <div key={key} className={`p-6 border rounded-xl ${cardClass}`}>
                <p className={`text-sm font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                </p>
                <p className="text-3xl font-bold mt-2">
                  {typeof value === 'number' ? value.toLocaleString() : String(value)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && !stats && (
        <p className={`text-center py-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          No analytics data available.
        </p>
      )}
    </div>
  );
}
