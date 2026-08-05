import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function Members({ user, dark, setPage }: Props) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchMembers = async (query?: string) => {
    setLoading(true);
    setError('');
    try {
      const data = query
        ? await apiFetch(`/members/search?q=${encodeURIComponent(query)}`)
        : await apiFetch('/members');
      setMembers(Array.isArray(data) ? data : data.members || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers(search.trim() || undefined);
  };

  const cardClass = dark
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
          Members
        </h1>
        <button
          onClick={() => setPage('create-member')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Add Member
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

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

      {!loading && !error && members.length === 0 && (
        <p className={`text-center py-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          No members found.
        </p>
      )}

      {!loading && !error && members.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member: any) => (
            <div
              key={member.id || member._id}
              className={`p-4 border rounded-lg ${cardClass}`}
            >
              <h3 className="font-semibold text-lg">
                {member.user?.firstName || member.firstName || ''} {member.user?.lastName || member.lastName || ''}
              </h3>
              <div className={`mt-2 text-sm space-y-1 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                <p>ID: <span className="font-mono">{member.memberId || member.id}</span></p>
                <p>Phone: {member.user?.phone || member.phone || 'N/A'}</p>
                <p>Email: {member.user?.email || member.email || 'N/A'}</p>
                {member.subscriptions && member.subscriptions[0] && (
                  <p className="mt-1"><span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">{member.subscriptions[0].package?.name || 'Active'}</span></p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
