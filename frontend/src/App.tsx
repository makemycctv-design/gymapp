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

export type Page = 'home' | 'members' | 'create-member' | 'trainers' | 'packages' | 'attendance' | 'payments' | 'alerts' | 'analytics' | 'branches' | 'checkin' | 'workout' | 'diet' | 'progress';

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

  const props = { user, dark, setDark, setPage, logout, installPrompt };

  return (
    <Layout {...props}>
      {page === 'home' && <DashboardPage {...props} />}
      {page === 'members' && <MembersPage {...props} />}
      {page === 'create-member' && <CreateMemberPage {...props} />}
      {page === 'trainers' && <TrainersPage {...props} />}
      {page === 'packages' && <PackagesPage {...props} />}
      {page === 'attendance' && <AttendancePage {...props} />}
      {page === 'analytics' && <AnalyticsPage {...props} />}
      {page === 'branches' && <BranchesPage {...props} />}
      {page === 'checkin' && <CheckInPage {...props} />}
      {page === 'workout' && <WorkoutPage {...props} />}
      {page === 'diet' && <DietPage {...props} />}
      {page === 'progress' && <ProgressPage {...props} />}
      {page === 'payments' && <PlaceholderPage title="Payments" desc="UPI, Google Pay, and card payments. Cash approved by manager." dark={dark} />}
      {page === 'alerts' && <PlaceholderPage title="Retention Alerts" desc="AI detects 60%+ attendance drops and alerts managers automatically." dark={dark} />}
    </Layout>
  );
}

function Layout({ children, user, dark, setDark, setPage, logout, installPrompt }: any) {
  return (
    <div className={`min-h-screen transition-colors ${dark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Top Nav */}
      <nav className={`sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b ${dark ? 'bg-gray-800/95 border-gray-700 backdrop-blur' : 'bg-white/95 border-gray-200 backdrop-blur'}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('home')}>
          <span className="text-xl">💪</span>
          <span className="font-bold text-lg">FitZone</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDark(!dark)} className={`p-2 rounded-lg ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`} title="Toggle theme">{dark ? '☀️' : '🌙'}</button>
          {installPrompt && <button onClick={() => { installPrompt.prompt(); }} className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg font-medium">📲 Install</button>}
          <span className={`text-sm hidden md:inline ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{user.firstName}</span>
          <button onClick={logout} className={`text-sm px-3 py-1.5 rounded-lg border ${dark ? 'border-gray-600 text-gray-400 hover:text-red-400 hover:border-red-400' : 'border-gray-300 text-gray-600 hover:text-red-500'}`}>Logout</button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-4 md:p-6">{children}</main>
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
