import { useState } from 'react';
import { apiPost } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function CheckIn({ user, dark, setPage }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleGeoCheckIn = async () => {
    setLoading(true);
    setMessage('');

    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported by your browser.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await apiPost('/attendance/geo-fence', { latitude, longitude });
          setMessage('Check-in successful! You are within the gym area.');
          setMessageType('success');
        } catch (err: any) {
          setMessage(err.message || 'Check-in failed. You may be outside the geo-fence.');
          setMessageType('error');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setMessage(`Location access denied: ${err.message}`);
        setMessageType('error');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const cardClass = dark
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200';

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className={`text-2xl font-bold mb-6 text-center ${dark ? 'text-white' : 'text-gray-900'}`}>
        GPS Check-In
      </h1>


      <div className={`p-8 border rounded-xl text-center ${cardClass}`}>
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
            Tap the button below to check in using your current GPS location.
            Make sure you are within the gym premises.
          </p>
        </div>

        <button
          onClick={handleGeoCheckIn}
          disabled={loading}
          className="w-full px-6 py-4 bg-green-600 text-white text-lg font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Getting Location...
            </span>
          ) : (
            'Check In Now'
          )}
        </button>

        {message && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-100 border border-green-300 text-green-700'
                : 'bg-red-100 border border-red-300 text-red-700'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
