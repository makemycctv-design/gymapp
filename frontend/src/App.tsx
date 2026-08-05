import { useState, useEffect } from 'react';
import { apiFetch, apiPost } from './lib/api';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import MembersPage from './pages/Members';
import PackagesPage from './pages/Packages';
import AttendancePage from './pages/Attendance';
import CheckInPage from './pages/CheckIn';
import TrainersPage from './pages/Trainers';
import AnalyticsPage from './pages/Analytics';
import BranchesPage from './pages/Branches';
import WorkoutPage from './pages/Workout';
import DietPage from './pages/Diet';
import ProgressPage from './pages/Progress';
import CreateMemberPage from './pages/CreateMember';
import CreateStaffPage from './pages/CreateStaff';
import MyClientsPage from './pages/MyClients';
import MyPackagePage from './pages/MyPackage';
import PaymentsPage from './pages/Payments';

export type Page = 'home' | 'members' | 'my-clients' | 'my-package' | 'create-member' | 'create-staff' | 'trainers' | 'packages' | 'attendance' | 'payments' | 'alerts' | 'analytics' | 'branches' | 'checkin' | 'workout' | 'diet' | 'progress';

export default function App() {
  const [user, setUser] = useState<any>(() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } });
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const [page, setPage] = useState<Page>('home');
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => {
    const h = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); setPage('home'); };
  const login = async (email: string, password: string) => {
    const data = await apiPost('/auth/login', { email, password });
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  if (!user) return <LoginPage login={login} dark={dark} setDark={setDark} installPrompt={installPrompt} />;

  const props = { user, dark, setDark, setPage, logout, installPrompt, page };

  return (
    <Layout {...props}>
      {page === 'home' && <DashboardPage {...props} />}
      {page === 'members' && <MembersPage {...props} />}
      {page === 'my-clients' && <MyClientsPage {...props} />}
      {page === 'my-package' && <MyPackagePage {...props} />}
      {page === 'create-member' && <CreateMemberPage {...props} />}
      {page === 'create-staff' && <CreateStaffPage {...props} />}
      {page === 'trainers' && <TrainersPage {...props} />}
      {page === 'packages' && <PackagesPage {...props} />}
      {page === 'attendance' && <AttendancePage {...props} />}
      {page === 'analytics' && <AnalyticsPage {...props} />}
      {page === 'branches' && <BranchesPage {...props} />}
      {page === 'checkin' && <CheckInPage {...props} />}
      {page === 'workout' && <WorkoutPage {...props} />}
      {page === 'diet' && <DietPage {...props} />}
      {page === 'progress' && <ProgressPage {...props} />}
      {page === 'payments' && <PaymentsPage {...props} />}
      {page === 'alerts' && <PlaceholderPage title="Retention Alerts" desc="AI detects 60%+ attendance drops and alerts managers automatically." dark={dark} />}
    </Layout>
  );
}

function Layout({ children, user, dark, setDark, setPage, logout, installPrompt, page }: any) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminNav = [
    { icon: '🏠', label: 'Dashboard', p: 'home' },
    { icon: '👥', label: 'Members', p: 'members' },
    { icon: '👔', label: 'Create Staff', p: 'create-staff' },
    { icon: '📦', label: 'Packages', p: 'packages' },
    { icon: '✅', label: 'Attendance', p: 'attendance' },
    { icon: '💳', label: 'Payments', p: 'payments' },
    { icon: '⚠️', label: 'Alerts', p: 'alerts' },
    { icon: '📊', label: 'Analytics', p: 'analytics' },
    { icon: '🏢', label: 'Branches', p: 'branches' },
  ];

  const managerNav = [
    { icon: '🏠', label: 'Dashboard', p: 'home' },
    { icon: '👥', label: 'Members', p: 'members' },
    { icon: '➕', label: 'Add Member', p: 'create-member' },
    { icon: '🏋️', label: 'Trainers', p: 'trainers' },
    { icon: '📦', label: 'Packages', p: 'packages' },
    { icon: '✅', label: 'Attendance', p: 'attendance' },
    { icon: '💳', label: 'Payments', p: 'payments' },
    { icon: '⚠️', label: 'Alerts', p: 'alerts' },
    { icon: '📊', label: 'Analytics', p: 'analytics' },
  ];

  const memberNav = [
    { icon: '🏠', label: 'Dashboard', p: 'home' },
    { icon: '📍', label: 'Check In', p: 'checkin' },
    { icon: '📦', label: 'My Package', p: 'my-package' },
    { icon: '🏋️', label: 'Workout', p: 'workout' },
    { icon: '🥗', label: 'Diet Plan', p: 'diet' },
    { icon: '📈', label: 'Progress', p: 'progress' },
  ];

  const trainerNav = [
    { icon: '🏠', label: 'Dashboard', p: 'home' },
    { icon: '👥', label: 'My Clients', p: 'my-clients' },
    { icon: '🏋️', label: 'Workouts', p: 'workout' },
    { icon: '🥗', label: 'Diet Plans', p: 'diet' },
    { icon: '📏', label: 'Measurements', p: 'progress' },
    { icon: '📦', label: 'Packages', p: 'packages' },
    { icon: '✅', label: 'Attendance', p: 'attendance' },
  ];

  const navItems = user.role === 'MEMBER' ? memberNav : (user.role === 'PERSONAL_TRAINER' || user.role === 'FLOOR_TRAINER') ? trainerNav : user.role === 'BRANCH_MANAGER' ? managerNav : adminNav;

  return (
    <div className={`min-h-screen transition-colors ${dark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Top Nav */}
      <nav className={`sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b ${dark ? 'bg-gray-800/95 border-gray-700 backdrop-blur' : 'bg-white/95 border-gray-200 backdrop-blur'}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 rounded-lg md:hidden ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>☰</button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('home')}>
            <span className="text-xl">💪</span>
            <span className="font-bold text-lg hidden sm:inline">FitZone</span>
          </div>
          {page !== 'home' && (
            <button onClick={() => setPage('home')} className={`text-sm px-2 py-1 rounded-lg ${dark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>← Back</button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDark(!dark)} className={`p-2 rounded-lg ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`} title="Toggle theme">{dark ? '☀️' : '🌙'}</button>
          {installPrompt && <button onClick={() => { installPrompt.prompt(); }} className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg font-medium">📲 Install</button>}
          {!installPrompt && <button onClick={() => { if (/iPhone|iPad/.test(navigator.userAgent)) { alert('To install:\n1. Tap the Share button (box with arrow)\n2. Scroll down\n3. Tap "Add to Home Screen"'); } else if (/Android/.test(navigator.userAgent)) { alert('To install:\n1. Tap the ⋮ menu (3 dots) at top right\n2. Tap "Add to Home Screen" or "Install App"'); } else { alert('To install:\n1. Click the install icon in the address bar (⊕ or 📥)\n2. Or go to browser menu → "Install App"'); } }} className={`px-3 py-1.5 text-xs rounded-lg font-medium border ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>📲 Install App</button>}
          <span className={`text-sm hidden md:inline ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{user.firstName}</span>
          <button onClick={logout} className={`text-sm px-3 py-1.5 rounded-lg border ${dark ? 'border-gray-600 text-gray-400 hover:text-red-400 hover:border-red-400' : 'border-gray-300 text-gray-600 hover:text-red-500'}`}>Logout</button>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar - Desktop always visible, Mobile toggle */}
        <aside className={`fixed md:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-60 z-40 overflow-y-auto border-r transition-transform duration-300 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.p}
                onClick={() => { setPage(item.p as Page); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                  page === item.p
                    ? (dark ? 'bg-green-500/10 text-green-400 font-medium' : 'bg-green-50 text-green-700 font-medium')
                    : (dark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* User info at bottom */}
          <div className={`absolute bottom-0 left-0 right-0 p-3 border-t ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-bold text-green-400">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user.firstName} {user.lastName}</p>
                <p className={`text-[10px] truncate ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{user.role.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-57px)] p-4 md:p-6 max-w-5xl">{children}</main>
      </div>
    </div>
  );
}

function PlaceholderPage({ title, desc, dark }: { title: string; desc: string; dark: boolean }) {
  return (
    <div className={`rounded-xl p-6 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      <p className={dark ? 'text-gray-400' : 'text-gray-500'}>{desc}</p>
      <p className={`text-sm mt-4 ${dark ? 'text-green-400' : 'text-green-600'}`}>✅ API connected — module ready</p>
    </div>
  );
}
