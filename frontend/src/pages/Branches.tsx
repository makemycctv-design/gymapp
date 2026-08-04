import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function Branches({ user, dark, setPage }: Props) {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/branches')
      .then((data) => setBranches(Array.isArray(data) ? data : data.branches || []))
      .catch((err) => setError(err.message || 'Failed to fetch branches'))
      .finally(() => setLoading(false));
  }, []);

  const cardClass = dark
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200';

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>
        Branches
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

      {!loading && !error && branches.length === 0 && (
        <p className={`text-center py-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          No branches found.
        </p>
      )}

      {!loading && !error && branches.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch: any) => (
            <div
              key={branch.id || branch._id}
              className={`p-6 border rounded-xl ${cardClass}`}
            >
              <h3 className="text-lg font-bold mb-3">{branch.name}</h3>
              <div className={`space-y-2 text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                <p>
                  <span className="font-medium">Address:</span>{' '}
                  {branch.address || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">City:</span>{' '}
                  {branch.city || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Geo-fence Radius:</span>{' '}
                  {branch.geoFenceRadius || branch.radius
                    ? `${branch.geoFenceRadius || branch.radius} meters`
                    : 'N/A'}
                </p>
                {branch.latitude && branch.longitude && (
                  <p className="text-xs font-mono">
                    Coords: {branch.latitude}, {branch.longitude}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
