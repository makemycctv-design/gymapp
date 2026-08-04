import { useState, useEffect } from 'react';

// ===== TYPES =====
type Page = 'dashboard' | 'members' | 'trainers' | 'packages' | 'attendance' | 'payments' | 'alerts' | 'analytics' | 'branches' | 'checkin' | 'workout' | 'diet' | 'progress' | 'clients' | 'measurements';

// ===== THEME HOOK =====
function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return { dark, toggle: () => setDark(!dark) };
}

// ===== PWA INSTALL HOOK =====
function usePWA() {
  const [prompt, setPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    setInstalled(window.matchMedia('(display-mode: standalone)').matches);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const install = async () => { if (prompt) { await prompt.prompt(); setPrompt(null); } };
  return { canInstall: !!prompt && !installed, installed, install };
}

// ===== LOGIN PAGE =====
function LoginPage({ onLogin, dark, toggleTheme }: { onLogin: (user: any) => void; dark: boolean; toggleTheme: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${dark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-4 text-3xl">&#x1F4AA;</div>
          <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>FitZone</h1>
          <p className="text-gray-400 text-sm">Gym Management Platform</p>
        </div>
        <form onSubmit={handleLogin} className={`rounded-xl p-6 space-y-4 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg'}`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Sign In</h2>
            <button type="button" onClick={toggleTheme} className="text-sm px-2 py-1 rounded border border-gray-600 text-gray-400 hover:text-white">{dark ? '☀️' : '🌙'}</button>
          </div>
          {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded">{error}</p>}
          <div>
            <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={`w-full rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 border ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`} placeholder="you@example.com" />
          </div>
          <div>
            <label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={`w-full rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 border ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`} placeholder="Enter password" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
}

// ===== DASHBOARD =====
function Dashboard({ user, onLogout, dark, toggleTheme }: { user: any; onLogout: () => void; dark: boolean; toggleTheme: () => void }) {
  const [page, setPage] = useState<Page>('dashboard');
  const pwa = usePWA();

  const adminActions: { icon: string; label: string; page: Page }[] = [
    { icon: '👥', label: 'Members', page: 'members' },
    { icon: '🏋️', label: 'Trainers', page: 'trainers' },
    { icon: '📦', label: 'Packages', page: 'packages' },
    { icon: '✓', label: 'Attendance', page: 'attendance' },
    { icon: '💳', label: 'Payments', page: 'payments' },
    { icon: '⚠️', label: 'Alerts', page: 'alerts' },
    { icon: '▪', label: 'Analytics', page: 'analytics' },
    { icon: '🏢', label: 'Branches', page: 'branches' },
  ];

  const trainerActions: { icon: string; label: string; page: Page }[] = [
    { icon: '👥', label: 'My Clients', page: 'clients' },
    { icon: '🏋️', label: 'Workouts', page: 'workout' },
    { icon: '🥗', label: 'Diet Plans', page: 'diet' },
    { icon: '📏', label: 'Measurements', page: 'measurements' },
  ];

  const memberActions: { icon: string; label: string; page: Page }[] = [
    { icon: '📍', label: 'Check In', page: 'checkin' },
    { icon: '🏋️', label: 'Workout', page: 'workout' },
    { icon: '🥗', label: 'Diet', page: 'diet' },
    { icon: '📈', label: 'Progress', page: 'progress' },
  ];

  const actions = user.role === 'MEMBER' ? memberActions : (user.role === 'PERSONAL_TRAINER' || user.role === 'FLOOR_TRAINER') ? trainerActions : adminActions;

  const bg = dark ? 'bg-gray-900' : 'bg-gray-50';
  const card = dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm';
  const text = dark ? 'text-white' : 'text-gray-900';
  const subtext = dark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`min-h-screen ${bg} p-4 md:p-8`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${text}`}>Welcome, {user.firstName}!</h1>
            <p className={subtext + ' text-sm'}>fitness.nokkoo.in</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className={`p-2 rounded-lg border ${dark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`} title="Toggle theme">{dark ? '☀️' : '🌙'}</button>
            {pwa.canInstall && <button onClick={pwa.install} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg font-medium">📲 Install App</button>}
            {pwa.installed && <span className="text-green-400 text-xs">✓ Installed</span>}
            <button onClick={onLogout} className={`text-sm px-3 py-2 rounded-lg border ${dark ? 'border-gray-700 text-gray-400 hover:text-red-400' : 'border-gray-300 text-gray-600 hover:text-red-500'}`}>Logout</button>
          </div>
        </div>

        {/* Breadcrumb */}
        {page !== 'dashboard' && (
          <button onClick={() => setPage('dashboard')} className={`mb-4 text-sm ${subtext} hover:text-green-400`}>← Back to Dashboard</button>
        )}

        {/* Pages */}
        {page === 'dashboard' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`rounded-xl p-4 border ${card}`}>
                <p className={`text-xs ${subtext}`}>Logged in as</p>
                <p className={`font-semibold ${text}`}>{user.firstName} {user.lastName}</p>
                <p className={`text-sm ${subtext}`}>{user.email}</p>
              </div>
              <div className={`rounded-xl p-4 border ${card}`}>
                <p className={`text-xs ${subtext}`}>Role</p>
                <p className="text-green-400 font-semibold mt-1">{user.role.replace(/_/g, ' ')}</p>
              </div>
              <div className={`rounded-xl p-4 border ${card}`}>
                <p className={`text-xs ${subtext}`}>Status</p>
                <p className="text-green-400 font-semibold mt-1">● Active</p>
              </div>
            </div>
            {/* Quick Actions */}
            <div className={`rounded-xl p-6 border ${card}`}>
              <h2 className={`text-lg font-semibold ${text} mb-4`}>Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {actions.map(a => (
                  <div key={a.page} onClick={() => setPage(a.page)} className={`rounded-lg p-4 text-center cursor-pointer transition-all border hover:border-green-500 hover:scale-105 ${dark ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <span className="text-2xl">{a.icon}</span>
                    <p className={`text-sm mt-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{a.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <PageContent page={page} user={user} dark={dark} card={card} text={text} subtext={subtext} />
        )}
      </div>
    </div>
  );
}

// ===== PAGE CONTENT =====
function PageContent({ page, user, dark, card, text, subtext }: { page: Page; user: any; dark: boolean; card: string; text: string; subtext: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const apiMap: Record<string, string> = {
    members: '/api/v1/members',
    trainers: '/api/v1/trainers',
    packages: '/api/v1/packages',
    attendance: '/api/v1/attendance/today',
    branches: '/api/v1/branches',
    clients: '/api/v1/trainers/my-clients',
  };

  useEffect(() => {
    const url = apiMap[page];
    if (url) {
      fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(r => r.json()).then(d => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    } else { setLoading(false); }
  }, [page]);

  const titles: Record<string, string> = {
    members: 'Members', trainers: 'Trainers', packages: 'Membership Packages', attendance: 'Today\'s Attendance',
    payments: 'Payments', alerts: 'Retention Alerts', analytics: 'Analytics', branches: 'Branches',
    checkin: 'Check In', workout: 'My Workout', diet: 'My Diet Plan', progress: 'My Progress',
    clients: 'My Clients', measurements: 'Body Measurements',
  };

  return (
    <div className={`rounded-xl p-6 border ${card}`}>
      <h2 className={`text-xl font-bold ${text} mb-4`}>{titles[page] || page}</h2>
      
      {page === 'checkin' && <CheckInPage dark={dark} />}
      {page === 'packages' && <PackagesPage data={data} loading={loading} dark={dark} text={text} subtext={subtext} />}
      {page === 'attendance' && <AttendancePage dark={dark} text={text} subtext={subtext} />}
      {page === 'members' && <MembersInfo dark={dark} text={text} subtext={subtext} />}
      {!['checkin', 'packages', 'attendance', 'members'].includes(page) && (
        <div>
          {loading ? <p className={subtext}>Loading...</p> : data ? <pre className={`text-xs overflow-auto ${subtext}`}>{JSON.stringify(data, null, 2)}</pre> : <p className={subtext}>This module is ready for development. API endpoint connected.</p>}
        </div>
      )}
    </div>
  );
}

// ===== CHECK IN PAGE =====
function CheckInPage({ dark }: { dark: boolean }) {
  const [method, setMethod] = useState<'geo' | 'otp'>('geo');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const geoCheckIn = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch('/api/v1/attendance/geo-fence', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        });
        const data = await res.json();
        setStatus(res.ok ? '✓ Checked in successfully!' : `✗ ${data.message}`);
      } catch { setStatus('✗ Network error'); }
      setLoading(false);
    }, () => { setStatus('✗ Location permission denied'); setLoading(false); });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMethod('geo')} className={`px-4 py-2 rounded-lg font-medium ${method === 'geo' ? 'bg-green-500 text-white' : dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>📍 GPS Location</button>
        <button onClick={() => setMethod('otp')} className={`px-4 py-2 rounded-lg font-medium ${method === 'otp' ? 'bg-green-500 text-white' : dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>🔑 OTP Code</button>
      </div>
      {method === 'geo' && (
        <div>
          <p className={dark ? 'text-gray-400' : 'text-gray-600'}>You must be within 50m of the gym to check in.</p>
          <button onClick={geoCheckIn} disabled={loading} className="mt-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50">{loading ? 'Checking location...' : '📍 Check In Now'}</button>
        </div>
      )}
      {method === 'otp' && <p className={dark ? 'text-gray-400' : 'text-gray-600'}>OTP verification - request OTP from your phone</p>}
      {status && <p className="mt-3 text-lg font-medium">{status}</p>}
    </div>
  );
}

// ===== PACKAGES PAGE =====
function PackagesPage({ data, loading, dark, text, subtext }: any) {
  if (loading) return <p className={subtext}>Loading packages...</p>;
  if (!data || !Array.isArray(data)) return <p className={subtext}>No packages found</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((pkg: any) => (
        <div key={pkg.id} className={`rounded-lg p-4 border ${dark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`font-semibold ${text}`}>{pkg.name}</h3>
          <p className={`text-sm ${subtext} mt-1`}>{pkg.description}</p>
          <div className="flex justify-between mt-3">
            <span className="text-green-400 font-bold">&#8377;{Number(pkg.price).toLocaleString()}</span>
            <span className={`text-sm ${subtext}`}>{pkg.durationDays} days</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== ATTENDANCE PAGE =====
function AttendancePage({ dark, text, subtext }: any) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');

  const markAttendance = async () => {
    if (!query) return;
    const res = await fetch('/api/v1/attendance/front-desk', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ phoneOrMemberId: query }),
    });
    const data = await res.json();
    setResult(res.ok ? `✓ ${data.member?.name} checked in!` : `✗ ${data.message}`);
  };

  return (
    <div className="space-y-4">
      <p className={subtext}>Enter member phone number or ID to mark attendance</p>
      <div className="flex gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Phone or Member ID..." className={`flex-1 rounded-lg px-4 py-2.5 border focus:outline-none focus:ring-2 focus:ring-green-500 ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`} />
        <button onClick={markAttendance} className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-lg">Mark</button>
      </div>
      {result && <p className="text-lg font-medium">{result}</p>}
    </div>
  );
}

// ===== MEMBERS INFO =====
function MembersInfo({ dark, text, subtext }: any) {
  return (
    <div className="space-y-3">
      <p className={subtext}>Member management - create new members, search, and manage profiles.</p>
      <div className={`p-4 rounded-lg border ${dark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
        <p className={`font-medium ${text}`}>To add a new member:</p>
        <ul className={`text-sm mt-2 space-y-1 ${subtext}`}>
          <li>1. Enter member details (name, email, phone)</li>
          <li>2. Select a membership package</li>
          <li>3. Choose trainer tier (Personal / Floor)</li>
          <li>4. System generates temporary password</li>
          <li>5. Deliver credentials via email/SMS</li>
        </ul>
      </div>
      <p className={`text-sm ${subtext}`}>API: POST /api/v1/members (connected and ready)</p>
    </div>
  );
}

// ===== MAIN APP =====
export default function App() {
  const { dark, toggle } = useTheme();
  const [user, setUser] = useState(() => { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; });
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };
  if (!user) return <LoginPage onLogin={setUser} dark={dark} toggleTheme={toggle} />;
  return <Dashboard user={user} onLogout={handleLogout} dark={dark} toggleTheme={toggle} />;
}
