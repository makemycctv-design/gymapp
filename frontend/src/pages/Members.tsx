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
  const [viewMember, setViewMember] = useState<any>(null);
  const [editMember, setEditMember] = useState<any>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', email: '' });

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
              <div className="flex gap-2 mt-3">
                <button onClick={() => setViewMember(member)} className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">View</button>
                <button onClick={() => { setEditMember(member); setEditForm({ firstName: member.user?.firstName || '', lastName: member.user?.lastName || '', phone: member.user?.phone || '', email: member.user?.email || '' }); }} className={`px-3 py-1 text-xs rounded border ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>Edit</button>
                <button onClick={async () => { if (!confirm(`Reset password for ${member.user?.firstName || 'this member'}?`)) return; try { const res = await fetch('/api/v1/members/reset-password/' + (member.user?.id || member.userId), { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); const data = await res.json(); if (res.ok) { alert(`New Password: ${data.credentials?.temporaryPassword}\n\nEmail: ${data.credentials?.email}\n\nShare this with the member.`); } else { alert(data.message || 'Failed'); } } catch {} }} className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600">Reset PW</button>
                <button onClick={async () => { if (!confirm(`Delete ${member.user?.firstName || 'this member'}?`)) return; try { await fetch('/api/v1/members/delete/' + (member.user?.id || member.userId), { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); fetchMembers(); } catch {} }} className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Member Modal */}
      {viewMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewMember(null)}>
          <div className={`w-full max-w-md rounded-xl p-6 ${dark ? 'bg-gray-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Member Details</h3>
            <div className={`space-y-2 text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
              <p><strong>Name:</strong> {viewMember.user?.firstName} {viewMember.user?.lastName}</p>
              <p><strong>Member ID:</strong> <span className="font-mono">{viewMember.memberId}</span></p>
              <p><strong>Email:</strong> {viewMember.user?.email}</p>
              <p><strong>Phone:</strong> {viewMember.user?.phone}</p>
              <p><strong>Gender:</strong> {viewMember.gender || 'N/A'}</p>
              <p><strong>Date of Birth:</strong> {viewMember.dateOfBirth ? new Date(viewMember.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Join Date:</strong> {viewMember.joinDate ? new Date(viewMember.joinDate).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Trainer Tier:</strong> {viewMember.trainerTier}</p>
              <p><strong>Status:</strong> {viewMember.user?.isActive !== false ? <span className="text-green-500">Active</span> : <span className="text-red-500">Inactive</span>}</p>
              {viewMember.subscriptions && viewMember.subscriptions[0] && (
                <div className={`mt-3 p-3 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className="font-medium">Active Subscription:</p>
                  <p>{viewMember.subscriptions[0].package?.name || 'N/A'}</p>
                  <p className="text-xs">Ends: {viewMember.subscriptions[0].endDate ? new Date(viewMember.subscriptions[0].endDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              )}
            </div>
            <button onClick={() => setViewMember(null)} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 w-full">Close</button>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditMember(null)}>
          <div className={`w-full max-w-md rounded-xl p-6 ${dark ? 'bg-gray-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Edit Member</h3>
            <div className="space-y-3">
              <div>
                <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>First Name</label>
                <input value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Last Name</label>
                <input value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
                <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { /* TODO: API call to update */ setEditMember(null); }} className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Save</button>
              <button onClick={() => setEditMember(null)} className={`flex-1 px-4 py-2 rounded-lg border ${dark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
