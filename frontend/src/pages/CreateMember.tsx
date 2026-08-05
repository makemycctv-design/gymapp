import { useState, useEffect } from 'react';
import { apiFetch, apiPost } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function CreateMember({ user, dark, setPage }: Props) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    packageId: '',
    trainerTier: 'FLOOR',
    assignedTrainerId: '',
  });
  const [packages, setPackages] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<any>(null);

  useEffect(() => {
    apiFetch('/packages').then((data) => setPackages(Array.isArray(data) ? data : [])).catch(() => {});
    apiFetch('/trainers').then((data) => setTrainers(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCredentials(null);
    try {
      const data = await apiPost('/members', form);
      setCredentials(data);
    } catch (err: any) {
      setError(err.message || 'Failed to create member');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = dark
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900';

  const cardClass = dark
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200';

  if (credentials) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className={`p-6 border rounded-lg ${cardClass}`}>
          <h2 className="text-xl font-bold mb-4 text-green-500">Member Created Successfully!</h2>
          <div className={`space-y-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
            {credentials.memberId && <p><strong>Member ID:</strong> <code className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-mono">{credentials.memberId}</code></p>}
            {credentials.credentials?.email && <p><strong>Login Email:</strong> <code className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-mono">{credentials.credentials.email}</code></p>}
            {credentials.credentials?.temporaryPassword && <p><strong>Temporary Password:</strong> <code className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-mono text-lg font-bold">{credentials.credentials.temporaryPassword}</code></p>}
            {credentials.user?.email && !credentials.credentials?.email && <p><strong>Login Email:</strong> <code className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-mono">{credentials.user.email}</code></p>}
          </div>
          <div className={`mt-4 p-3 rounded-lg ${dark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`text-sm font-medium ${dark ? 'text-yellow-400' : 'text-yellow-700'}`}>⚠️ Save these credentials now!</p>
            <p className={`text-xs mt-1 ${dark ? 'text-yellow-500' : 'text-yellow-600'}`}>Share the email and password with the member. They must change password on first login.</p>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                const creds = credentials.credentials || {};
                const msg = `Welcome to FitZone Gym! 🏋️\n\nYour login credentials:\n📧 Email: ${creds.email || ''}\n🔑 Password: ${creds.temporaryPassword || ''}\n🆔 Member ID: ${credentials.memberId || ''}\n\n🔗 Login at: https://fitness.nokkoo.in\n\n⚠️ Please change your password on first login.`;
                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <span>📱</span> Share via WhatsApp
            </button>
            <button
              onClick={() => setPage('members')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Back to Members
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className={`text-2xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>
        Create New Member
      </h1>

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`p-6 border rounded-lg space-y-4 ${cardClass}`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
            Date of Birth *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
            Gender *
          </label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
            Package *
          </label>
          <select
            name="packageId"
            value={form.packageId}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
          >
            <option value="">Select Package</option>
            {packages.map((pkg: any) => (
              <option key={pkg.id || pkg._id} value={pkg.id || pkg._id}>
                {pkg.name} - {'\u20B9'}{pkg.price}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
            Trainer Tier *
          </label>
          <select
            name="trainerTier"
            value={form.trainerTier}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
          >
            <option value="FLOOR">Floor Trainer</option>
            <option value="PERSONAL">Personal Trainer</option>
          </select>
        </div>

        {form.trainerTier === 'PERSONAL' && (
        <div>
          <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
            Assign Personal Trainer *
          </label>
          <select
            name="assignedTrainerId"
            value={form.assignedTrainerId}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
          >
            <option value="">Select Trainer...</option>
            {trainers.filter(t => t.user?.role === 'PERSONAL_TRAINER' && t.isAvailable).map((t: any) => (
              <option key={t.user?.id || t.id} value={t.user?.id || t.id}>{t.user?.firstName} {t.user?.lastName} ({t.currentClients || 0}/{t.maxClients || 15} clients)</option>
            ))}
          </select>
        </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Member'}
          </button>
          <button
            type="button"
            onClick={() => setPage('members')}
            className={`px-4 py-2 border rounded-lg transition ${
              dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
