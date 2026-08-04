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

  useEffect(() => {
    apiFetch('/trainers')
      .then((data) => setTrainers(Array.isArray(data) ? data : data.trainers || []))
      .catch((err) => setError(err.message || 'Failed to fetch trainers'))
      .finally(() => setLoading(false));
  }, []);

  const cardClass = dark
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200';

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>
        Trainers
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

      {!loading && !error && trainers.length === 0 && (
        <p className={`text-center py-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          No trainers found.
        </p>
      )}

      {!loading && !error && trainers.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trainers.map((trainer: any) => (
            <div
              key={trainer.id || trainer._id}
              className={`p-6 border rounded-xl ${cardClass}`}
            >
              <h3 className="text-lg font-bold mb-2">
                {trainer.firstName || trainer.name} {trainer.lastName || ''}
              </h3>
              <div className={`space-y-2 text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                {trainer.specializations && trainer.specializations.length > 0 && (
                  <div>
                    <p className="font-medium mb-1">Specializations:</p>
                    <div className="flex flex-wrap gap-1">
                      {trainer.specializations.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {trainer.certifications && trainer.certifications.length > 0 && (
                  <div>
                    <p className="font-medium mb-1">Certifications:</p>
                    <div className="flex flex-wrap gap-1">
                      {trainer.certifications.map((c: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="font-medium">Availability:</p>
                  <p>{trainer.availability || (trainer.isAvailable ? 'Available' : 'Not Available')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
