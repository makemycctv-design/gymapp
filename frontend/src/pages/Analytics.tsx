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

  useEffect(() => {
    apiFetch('/analytics/dashboard')
      .then((data) => setStats(data))
      .catch((err) => setError(err.message || 'Failed to fetch analytics'))
      .finally(() => setLoading(false));
  }, []);

  const cardClass = dark
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200';

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>
        Analytics Dashboard
      </h1>


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
