import { useState } from 'react';

export default function LoginPage({ login, dark, setDark, installPrompt }: any) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: any) => { e.preventDefault(); setErr(''); setLoading(true); try { await login(email, pass); } catch (e: any) { setErr(e.message); } setLoading(false); };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${dark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-4xl">💪</span>
          <h1 className={`text-2xl font-bold mt-2 ${dark ? 'text-white' : 'text-gray-900'}`}>FitZone</h1>
          <p className="text-gray-400 text-sm">Gym Management Platform</p>
        </div>
        <form onSubmit={submit} className={`rounded-xl p-6 space-y-4 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg'}`}>
          <div className="flex justify-between items-center">
            <h2 className={`font-bold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>Sign In</h2>
            <div className="flex gap-1">
              {installPrompt && <button type="button" onClick={() => installPrompt.prompt()} className="text-xs px-2 py-1 bg-blue-500 text-white rounded">📲</button>}
              <button type="button" onClick={() => setDark(!dark)} className={`text-sm px-2 py-1 rounded ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}>{dark ? '☀️' : '🌙'}</button>
            </div>
          </div>
          {err && <p className="text-red-400 text-sm bg-red-500/10 p-2 rounded text-center">{err}</p>}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email address" className={`w-full rounded-lg px-4 py-2.5 border focus:ring-2 focus:ring-green-500 focus:outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900'}`} />
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} required placeholder="Password" className={`w-full rounded-lg px-4 py-2.5 border focus:ring-2 focus:ring-green-500 focus:outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900'}`} />
          <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
          <p className="text-xs text-gray-500 text-center">Contact your branch manager for credentials</p>
        </form>
      </div>
    </div>
  );
}
