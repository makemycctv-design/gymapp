import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function Packages({ user, dark, setPage }: Props) {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/packages')
      .then((data) => {
        setPackages(Array.isArray(data) ? data : data.packages || []);
      })
      .catch((err) => setError(err.message || 'Failed to fetch packages'))
      .finally(() => setLoading(false));
  }, []);

  const cardClass = dark
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200';

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>
        Packages
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

      {!loading && !error && packages.length === 0 && (
        <p className={`text-center py-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          No packages available.
        </p>
      )}

      {!loading && !error && packages.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg: any) => (
            <div
              key={pkg.id || pkg._id}
              className={`p-6 border rounded-xl shadow-sm hover:shadow-md transition ${cardClass}`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold">{pkg.name}</h3>
                {pkg.includesPT && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    PT Included
                  </span>
                )}
              </div>
              <p className={`text-sm mb-4 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                {pkg.description || 'No description available'}
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {'\u20B9'}{pkg.price?.toLocaleString('en-IN') || pkg.price}
                  </p>
                  <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {pkg.duration || pkg.durationInDays || pkg.durationMonths
                      ? `${pkg.durationMonths ? pkg.durationMonths + ' months' : ''} ${pkg.durationInDays ? pkg.durationInDays + ' days' : ''} ${pkg.duration || ''}`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
