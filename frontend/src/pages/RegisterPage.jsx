import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { useGeolocation } from '../hooks/useGeolocation';

const ROLES = [
  { value: 'donor', label: 'Donor', hint: 'restaurant, kitchen, shop, or household with surplus food' },
  { value: 'receiver', label: 'Receiver', hint: 'shelter, NGO, or neighbor picking food up' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { position } = useGeolocation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'donor',
    organization: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        ...form,
        lat: position?.lat,
        lng: position?.lng,
        label: position?.label,
      });
      login(data.token, data.user);
      navigate('/board');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the account. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grain flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display font-bold text-2xl text-evergreen">
            FoodShare
          </Link>
          <p className="text-ink/60 text-sm mt-1 font-mono">open a manifest account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-ticket rounded-sm shadow-ticket p-6 space-y-4">
          {error && (
            <p className="text-sm text-tomato bg-tomato/10 border border-tomato/30 rounded-sm px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setForm({ ...form, role: r.value })}
                className={`text-left p-3 rounded-sm border transition-colors ${
                  form.role === r.value
                    ? 'border-evergreen bg-evergreen/10'
                    : 'border-line hover:border-evergreen/50'
                }`}
              >
                <p className="font-display font-semibold">{r.label}</p>
                <p className="text-xs text-ink/60 mt-0.5">{r.hint}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-line rounded-sm px-3 py-2 bg-paper/40 focus:outline-none focus:ring-2 focus:ring-evergreen"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
              Organization <span className="normal-case text-ink/30">(optional)</span>
            </label>
            <input
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              placeholder={form.role === 'donor' ? 'e.g. Green Table Bistro' : 'e.g. Hope Shelter Home'}
              className="w-full border border-line rounded-sm px-3 py-2 bg-paper/40 focus:outline-none focus:ring-2 focus:ring-evergreen"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-line rounded-sm px-3 py-2 bg-paper/40 focus:outline-none focus:ring-2 focus:ring-evergreen"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-line rounded-sm px-3 py-2 bg-paper/40 focus:outline-none focus:ring-2 focus:ring-evergreen"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-line rounded-sm px-3 py-2 bg-paper/40 focus:outline-none focus:ring-2 focus:ring-evergreen"
              placeholder="at least 6 characters"
            />
          </div>

          <p className="text-xs text-ink/50 font-mono">
            {position?.denied
              ? 'Location access was skipped - using a default area for now, update it later from your profile.'
              : position
              ? 'Location captured for nearby matching.'
              : 'Locating…'}
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-evergreen text-paper font-medium py-2.5 rounded-sm hover:bg-evergreen-dark transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-ink/60 mt-4">
          Already registered?{' '}
          <Link to="/login" className="text-evergreen font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
