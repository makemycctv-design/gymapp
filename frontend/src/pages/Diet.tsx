import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function Diet({ user, dark, setPage }: Props) {
  const [diet, setDiet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/diets/my')
      .then((data) => setDiet(data))
      .catch((err) => setError(err.message || 'Failed to fetch diet plan'))
      .finally(() => setLoading(false));
  }, []);

  const cardClass = dark
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200';

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>
        My Diet Plan
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

      {!loading && !error && !diet && (
        <p className={`text-center py-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          No diet plan assigned yet.
        </p>
      )}

      {!loading && !error && diet && (
        <div>
          {diet.name && (
            <p className={`text-lg mb-4 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
              Plan: <strong>{diet.name}</strong>
              {diet.totalCalories && (
                <span className="ml-3 text-sm">({diet.totalCalories} kcal/day)</span>
              )}
            </p>
          )}
          <div className="space-y-6">
            {(diet.days || diet.meals || []).map((day: any, idx: number) => (
              <div key={idx} className={`p-5 border rounded-xl ${cardClass}`}>
                <h3 className="text-lg font-semibold mb-3">
                  {day.day || day.dayName || `Day ${idx + 1}`}
                </h3>
                {(day.meals || [day]).filter((m: any) => m.mealType || m.name).length > 0 ? (
                  <div className="space-y-3">
                    {(day.meals || [day]).map((meal: any, mIdx: number) => (
                      <div key={mIdx} className={`p-3 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">
                            {meal.mealType || meal.name || `Meal ${mIdx + 1}`}
                          </span>
                          {meal.calories && (
                            <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {meal.calories} kcal
                            </span>
                          )}
                        </div>
                        {meal.items && (
                          <ul className={`text-sm list-disc list-inside ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {(Array.isArray(meal.items) ? meal.items : []).map((item: any, iIdx: number) => (
                              <li key={iIdx}>
                                {typeof item === 'string' ? item : `${item.name || item.food}${item.quantity ? ` - ${item.quantity}` : ''}`}
                              </li>
                            ))}
                          </ul>
                        )}
                        {meal.description && (
                          <p className={`text-sm mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {meal.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No meals listed for this day.
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
