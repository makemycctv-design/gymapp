import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function Workout({ user, dark, setPage }: Props) {
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/workouts/my')
      .then((data) => setWorkout(data))
      .catch((err) => setError(err.message || 'Failed to fetch workout plan'))
      .finally(() => setLoading(false));
  }, []);

  const cardClass = dark
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200';

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>
        My Workout Plan
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

      {!loading && !error && !workout && (
        <p className={`text-center py-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          No workout plan assigned yet.
        </p>
      )}

      {!loading && !error && workout && (
        <div>
          {workout.name && (
            <p className={`text-lg mb-4 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
              Plan: <strong>{workout.name}</strong>
            </p>
          )}
          <div className="space-y-6">
            {(workout.days || workout.exercises || []).map((day: any, idx: number) => (
              <div key={idx} className={`p-5 border rounded-xl ${cardClass}`}>
                <h3 className="text-lg font-semibold mb-3">
                  {day.day || day.dayName || `Day ${idx + 1}`}
                  {day.focus && (
                    <span className={`ml-2 text-sm font-normal ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                      - {day.focus}
                    </span>
                  )}
                </h3>
                {day.exercises && day.exercises.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className="text-left py-2 px-2">Exercise</th>
                          <th className="text-left py-2 px-2">Sets</th>
                          <th className="text-left py-2 px-2">Reps</th>
                          <th className="text-left py-2 px-2">Rest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {day.exercises.map((ex: any, exIdx: number) => (
                          <tr key={exIdx} className={`border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                            <td className="py-2 px-2 font-medium">{ex.name || ex.exercise}</td>
                            <td className="py-2 px-2">{ex.sets || '-'}</td>
                            <td className="py-2 px-2">{ex.reps || '-'}</td>
                            <td className="py-2 px-2">{ex.rest || ex.restPeriod || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {day.isRest ? 'Rest Day' : 'No exercises listed'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
