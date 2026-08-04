import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import type { Page } from '../App';

export default function DashboardPage({ user, dark, setPage }: { user: any; dark: boolean; setPage: (p: Page) => void }) {
  const [stats, setStats] = useState<any>(null);
  const card = dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm';
  const sub = dark ? 'text-gray-400' : 'text-gray-500';

  useEffect(() => {
    if (user.role === 'SUPER_ADMIN' || user.role === 'BRANCH_MANAGER') {
      apiFetch('/analytics/dashboard').then(setStats).catch(() => {});
    }
  }, []);

  const adminActions = [
    { icon: '👥', label: 'Members', p: 'members' as Page },
    { icon: '🏋️', label: 'Trainers', p: 'trainers' as Page },
    { icon: '📦', label: 'Packages', p: 'packages' as Page },
    { icon: '✅', label: 'Attendance', p: 'attendance' as Page },
    { icon: '💳', label: 'Payments', p: 'payments' as Page },
    { icon: '⚠️', label: 'Alerts', p: 'alerts' as Page },
    { icon: '📊', label: 'Analytics', p: 'analytics' as Page },
    { icon: '🏢', label: 'Branches', p: 'branches' as Page },
  ];

  const memberActions = [
    { icon: '📍', label: 'Check In', p: 'checkin' as Page },
    { icon: '🏋️', label: 'Workout', p: 'workout' as Page },
    { icon: '🥗', label: 'Diet Plan', p: 'diet' as Page },
    { icon: '📈', label: 'Progress', p: 'progress' as Page },
  ];

  const actions = user.role === 'MEMBER' ? memberActions : user.role === 'BRANCH_MANAGER' ? [{ icon: '➕', label: 'Add Member', p: 'create-member' as Page }, ...adminActions] : adminActions;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Members" value={stats.totalMembers} dark={dark} />
          <StatCard label="Active Subs" value={stats.activeSubscriptions} dark={dark} />
          <StatCard label="Today Check-ins" value={stats.todayAttendance} dark={dark} />
          <StatCard label="Monthly Revenue" value={`₹${(stats.monthlyRevenue || 0).toLocaleString()}`} dark={dark} />
        </div>
      )}

      {/* User Info */}
      <div className={`rounded-xl p-4 border ${card}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-xl font-bold text-green-400">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <p className="font-semibold">{user.firstName} {user.lastName}</p>
            <p className={`text-sm ${sub}`}>{user.role.replace(/_/g, ' ')} • {user.email}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`rounded-xl p-5 border ${card}`}>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {actions.map(a => (
            <button key={a.p} onClick={() => setPage(a.p)} className={`rounded-xl p-4 text-center transition-all border hover:border-green-500 hover:scale-[1.03] active:scale-95 ${dark ? 'bg-gray-700/50 border-gray-700 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-green-50'}`}>
              <span className="text-2xl block mb-1">{a.icon}</span>
              <p className="text-xs font-medium">{a.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, dark }: { label: string; value: any; dark: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
