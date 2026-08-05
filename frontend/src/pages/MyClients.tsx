import { useState, useEffect } from 'react';
import { apiFetch, apiPost } from '../lib/api';

interface Props {
  user: any;
  dark: boolean;
  setPage: (page: string) => void;
}

export default function MyClients({ user, dark, setPage }: Props) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [tab, setTab] = useState<'info' | 'workout' | 'diet' | 'measurements'>('info');
  const [workoutForm, setWorkoutForm] = useState({ name: '', exercises: '' });
  const [dietForm, setDietForm] = useState({ name: '', targetCalories: 2000, proteinGrams: 150, carbsGrams: 200, fatGrams: 70 });
  const [measurementForm, setMeasurementForm] = useState({ weightKg: '', bodyFatPercentage: '', muscleMassKg: '', chestCm: '', waistCm: '', bicepsCm: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    apiFetch('/trainers/my-clients')
      .then(data => setClients(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const saveWorkout = async (e: any) => {
    e.preventDefault(); setSaving(true); setStatus('');
    try {
      await apiPost('/workouts', { memberId: selectedClient.id, name: workoutForm.name, description: '', exercises: [] });
      setStatus('✅ Workout plan saved!'); setWorkoutForm({ name: '', exercises: '' });
    } catch (err: any) { setStatus(`❌ ${err.message}`); }
    setSaving(false);
  };

  const saveDiet = async (e: any) => {
    e.preventDefault(); setSaving(true); setStatus('');
    try {
      await apiPost('/diets', { memberId: selectedClient.id, ...dietForm, meals: [] });
      setStatus('✅ Diet plan saved!');
    } catch (err: any) { setStatus(`❌ ${err.message}`); }
    setSaving(false);
  };

  const saveMeasurement = async (e: any) => {
    e.preventDefault(); setSaving(true); setStatus('');
    try {
      await apiPost('/measurements', { memberId: selectedClient.id, weightKg: Number(measurementForm.weightKg) || null, bodyFatPercentage: Number(measurementForm.bodyFatPercentage) || null, muscleMassKg: Number(measurementForm.muscleMassKg) || null, chestCm: Number(measurementForm.chestCm) || null, waistCm: Number(measurementForm.waistCm) || null, bicepsCm: Number(measurementForm.bicepsCm) || null, notes: measurementForm.notes });
      setStatus('✅ Measurement recorded!'); setMeasurementForm({ weightKg: '', bodyFatPercentage: '', muscleMassKg: '', chestCm: '', waistCm: '', bicepsCm: '', notes: '' });
    } catch (err: any) { setStatus(`❌ ${err.message}`); }
    setSaving(false);
  };

  const cardClass = dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200';
  const inputClass = dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';
  const tabClass = (active: boolean) => active ? 'bg-green-500 text-white' : (dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700');

  // Client detail view
  if (selectedClient) {
    return (
      <div className="p-4 md:p-6">
        <button onClick={() => { setSelectedClient(null); setStatus(''); }} className={`mb-4 text-sm ${dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>← Back to Clients</button>
        <div className={`rounded-xl p-5 border mb-4 ${cardClass}`}>
          <h2 className="text-xl font-bold">{selectedClient.user?.firstName} {selectedClient.user?.lastName}</h2>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{selectedClient.user?.email} • {selectedClient.user?.phone}</p>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>ID: {selectedClient.memberId}</p>
          {selectedClient.subscriptions?.[0] && <p className="text-sm text-green-500 mt-1">{selectedClient.subscriptions[0].package?.name}</p>}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setTab('info')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tabClass(tab === 'info')}`}>Info</button>
          <button onClick={() => setTab('workout')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tabClass(tab === 'workout')}`}>Workout</button>
          <button onClick={() => setTab('diet')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tabClass(tab === 'diet')}`}>Diet Plan</button>
          <button onClick={() => setTab('measurements')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tabClass(tab === 'measurements')}`}>Measurements</button>
        </div>

        {status && <p className={`mb-4 text-sm p-3 rounded-lg ${status.startsWith('✅') ? (dark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-700') : (dark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700')}`}>{status}</p>}

        {/* Info Tab */}
        {tab === 'info' && (
          <div className={`rounded-xl p-5 border ${cardClass}`}>
            <h3 className="font-bold mb-3">Client Information</h3>
            <div className={`space-y-2 text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
              <p><strong>Name:</strong> {selectedClient.user?.firstName} {selectedClient.user?.lastName}</p>
              <p><strong>Phone:</strong> {selectedClient.user?.phone}</p>
              <p><strong>Email:</strong> {selectedClient.user?.email}</p>
              <p><strong>Member ID:</strong> {selectedClient.memberId}</p>
              <p><strong>Gender:</strong> {selectedClient.gender || 'N/A'}</p>
              <p><strong>Trainer Tier:</strong> {selectedClient.trainerTier}</p>
              <p><strong>Join Date:</strong> {selectedClient.joinDate ? new Date(selectedClient.joinDate).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        )}

        {/* Workout Tab */}
        {tab === 'workout' && (
          <div className={`rounded-xl p-5 border ${cardClass}`}>
            <h3 className="font-bold mb-3">Create Workout Plan</h3>
            <form onSubmit={saveWorkout} className="space-y-3">
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Plan Name *</label><input value={workoutForm.name} onChange={e => setWorkoutForm({...workoutForm, name: e.target.value})} required placeholder="e.g. Push/Pull/Legs - Week 1" className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Exercises (one per line)</label><textarea value={workoutForm.exercises} onChange={e => setWorkoutForm({...workoutForm, exercises: e.target.value})} rows={6} placeholder={"Monday: Bench Press 4x10, Incline DB 3x12\nTuesday: Squats 4x8, Leg Press 3x12\nWednesday: Rest"} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              <button type="submit" disabled={saving} className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">{saving ? 'Saving...' : 'Save Workout Plan'}</button>
            </form>
          </div>
        )}

        {/* Diet Tab */}
        {tab === 'diet' && (
          <div className={`rounded-xl p-5 border ${cardClass}`}>
            <h3 className="font-bold mb-3">Create Diet Plan</h3>
            <form onSubmit={saveDiet} className="space-y-3">
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Plan Name *</label><input value={dietForm.name} onChange={e => setDietForm({...dietForm, name: e.target.value})} required placeholder="e.g. Fat Loss - 2000 kcal" className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Target Calories</label><input type="number" value={dietForm.targetCalories} onChange={e => setDietForm({...dietForm, targetCalories: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
                <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Protein (g)</label><input type="number" value={dietForm.proteinGrams} onChange={e => setDietForm({...dietForm, proteinGrams: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
                <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Carbs (g)</label><input type="number" value={dietForm.carbsGrams} onChange={e => setDietForm({...dietForm, carbsGrams: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
                <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Fat (g)</label><input type="number" value={dietForm.fatGrams} onChange={e => setDietForm({...dietForm, fatGrams: Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              </div>
              <button type="submit" disabled={saving} className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">{saving ? 'Saving...' : 'Save Diet Plan'}</button>
            </form>
          </div>
        )}

        {/* Measurements Tab */}
        {tab === 'measurements' && (
          <div className={`rounded-xl p-5 border ${cardClass}`}>
            <h3 className="font-bold mb-3">Record Body Measurements</h3>
            <form onSubmit={saveMeasurement} className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Weight (kg)</label><input type="number" step="0.1" value={measurementForm.weightKg} onChange={e => setMeasurementForm({...measurementForm, weightKg: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
                <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Body Fat %</label><input type="number" step="0.1" value={measurementForm.bodyFatPercentage} onChange={e => setMeasurementForm({...measurementForm, bodyFatPercentage: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
                <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Muscle Mass (kg)</label><input type="number" step="0.1" value={measurementForm.muscleMassKg} onChange={e => setMeasurementForm({...measurementForm, muscleMassKg: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
                <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Chest (cm)</label><input type="number" step="0.1" value={measurementForm.chestCm} onChange={e => setMeasurementForm({...measurementForm, chestCm: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
                <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Waist (cm)</label><input type="number" step="0.1" value={measurementForm.waistCm} onChange={e => setMeasurementForm({...measurementForm, waistCm: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
                <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Biceps (cm)</label><input type="number" step="0.1" value={measurementForm.bicepsCm} onChange={e => setMeasurementForm({...measurementForm, bicepsCm: e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              </div>
              <div><label className={`block text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Notes</label><input value={measurementForm.notes} onChange={e => setMeasurementForm({...measurementForm, notes: e.target.value})} placeholder="Any observations..." className={`w-full px-3 py-2 border rounded-lg ${inputClass}`} /></div>
              <button type="submit" disabled={saving} className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">{saving ? 'Saving...' : 'Record Measurement'}</button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Client list view
  return (
    <div className="p-4 md:p-6">
      <h1 className={`text-2xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>My Clients</h1>

      {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>}
      {error && <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg mb-4">{error}</div>}

      {!loading && clients.length === 0 && (
        <div className={`text-center py-12 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-lg mb-2">No clients assigned yet</p>
          <p className="text-sm">Members will appear here when assigned to you by the Branch Manager.</p>
        </div>
      )}

      {!loading && clients.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client: any) => (
            <div key={client.id} className={`p-5 border rounded-xl cursor-pointer hover:border-green-500 transition ${cardClass}`} onClick={() => setSelectedClient(client)}>
              <h3 className="font-bold text-lg">{client.user?.firstName} {client.user?.lastName}</h3>
              <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{client.user?.phone}</p>
              <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{client.user?.email}</p>
              <p className={`text-xs mt-2 font-mono ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{client.memberId}</p>
              {client.subscriptions?.[0] && <p className="text-xs text-green-500 mt-1">{client.subscriptions[0].package?.name}</p>}
              <p className={`text-xs mt-2 text-blue-500`}>Click to manage →</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
