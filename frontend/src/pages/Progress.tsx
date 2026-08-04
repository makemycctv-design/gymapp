import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function Progress({ user, dark, setPage }: Props) {
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/measurements/my')
      .then((data) => {
        setMeasurements(Array.isArray(data) ? data : data.measurements || []);
      })
      .catch((err) => setError(err.message || 'Failed to fetch measurements'))
      .finally(() => setLoading(false));
  }, []);

  const cardClass = dark
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200';

  const latest = measurements.length > 0 ? measurements[0] : null;

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>
        My Progress
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

      {!loading && !error && measurements.length === 0 && (
        <p className={`text-center py-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          No measurement history available.
        </p>
      )}

      {!loading && !error && measurements.length > 0 && (
        <>
          {/* Latest Stats Cards */}
          {latest && (
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <div className={`p-5 border rounded-xl text-center ${cardClass}`}>
                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Weight</p>
                <p className="text-3xl font-bold mt-1">
                  {latest.weight ? `${latest.weight} kg` : 'N/A'}
                </p>
              </div>
              <div className={`p-5 border rounded-xl text-center ${cardClass}`}>
                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>BMI</p>
                <p className="text-3xl font-bold mt-1">
                  {latest.bmi ? latest.bmi.toFixed(1) : 'N/A'}
                </p>
              </div>
              <div className={`p-5 border rounded-xl text-center ${cardClass}`}>
                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Body Fat</p>
                <p className="text-3xl font-bold mt-1">
                  {latest.bodyFat ? `${latest.bodyFat}%` : 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* History Table */}
          <div className={`p-5 border rounded-xl ${cardClass}`}>
            <h2 className="text-lg font-semibold mb-4">Measurement History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-left py-2 px-3">Weight (kg)</th>
                    <th className="text-left py-2 px-3">BMI</th>
                    <th className="text-left py-2 px-3">Body Fat %</th>
                    <th className="text-left py-2 px-3">Muscle Mass</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m: any, idx: number) => (
                    <tr
                      key={m.id || m._id || idx}
                      className={`border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}
                    >
                      <td className="py-2 px-3">
                        {m.date || m.createdAt
                          ? new Date(m.date || m.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="py-2 px-3">{m.weight || '-'}</td>
                      <td className="py-2 px-3">{m.bmi ? m.bmi.toFixed(1) : '-'}</td>
                      <td className="py-2 px-3">{m.bodyFat ? `${m.bodyFat}%` : '-'}</td>
                      <td className="py-2 px-3">{m.muscleMass ? `${m.muscleMass} kg` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
