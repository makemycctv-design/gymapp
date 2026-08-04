import { useState, useEffect } from 'react';
import { apiFetch, apiPost } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function Attendance({ user, dark, setPage }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [todayList, setTodayList] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);

  const fetchToday = async () => {
    setListLoading(true);
    try {
      const data = await apiFetch('/attendance/today');
      setTodayList(Array.isArray(data) ? data : data.attendance || data.records || []);
    } catch {
      setTodayList([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      await apiPost('/attendance/front-desk', { identifier: identifier.trim() });
      setMessage('Check-in successful!');
      setMessageType('success');
      setIdentifier('');
      fetchToday();
    } catch (err: any) {
      setMessage(err.message || 'Check-in failed');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const cardClass = dark
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200';

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>
        Front Desk Attendance
      </h1>

      <div className={`p-6 border rounded-lg mb-6 ${cardClass}`}>
        <h2 className="text-lg font-semibold mb-4">Check-In Member</h2>
        <form onSubmit={handleCheckIn} className="flex gap-3">
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter phone number or member ID"
            className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Checking in...' : 'Check In'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-100 border border-green-300 text-green-700'
                : 'bg-red-100 border border-red-300 text-red-700'
            }`}
          >
            {message}
          </div>
        )}
      </div>

      <div className={`p-6 border rounded-lg ${cardClass}`}>
        <h2 className="text-lg font-semibold mb-4">Today's Attendance</h2>

        {listLoading && (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!listLoading && todayList.length === 0 && (
          <p className={`text-center py-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            No attendance recorded today.
          </p>
        )}

        {!listLoading && todayList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="text-left py-2 px-3">Member</th>
                  <th className="text-left py-2 px-3">ID</th>
                  <th className="text-left py-2 px-3">Time</th>
                  <th className="text-left py-2 px-3">Method</th>
                </tr>
              </thead>
              <tbody>
                {todayList.map((record: any, idx: number) => (
                  <tr
                    key={record.id || record._id || idx}
                    className={`border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}
                  >
                    <td className="py-2 px-3">
                      {record.memberName || record.member?.firstName || 'N/A'}
                    </td>
                    <td className="py-2 px-3 font-mono text-xs">
                      {record.memberId || record.member?.memberId || 'N/A'}
                    </td>
                    <td className="py-2 px-3">
                      {record.checkInTime
                        ? new Date(record.checkInTime).toLocaleTimeString()
                        : record.createdAt
                        ? new Date(record.createdAt).toLocaleTimeString()
                        : 'N/A'}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {record.method || record.type || 'front-desk'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
