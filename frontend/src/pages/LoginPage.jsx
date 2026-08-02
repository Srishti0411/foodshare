import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/board');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grain flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-display font-bold text-2xl text-evergreen">
            FoodShare
          </Link>
          <p className="text-ink/60 text-sm mt-1 font-mono">sign in to the manifest</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-ticket rounded-sm shadow-ticket p-6 space-y-4">
          {error && (
            <p className="text-sm text-tomato bg-tomato/10 border border-tomato/30 rounded-sm px-3 py-2">
              {error}
            </p>
          )}
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-line rounded-sm px-3 py-2 bg-paper/40 focus:outline-none focus:ring-2 focus:ring-evergreen"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-line rounded-sm px-3 py-2 bg-paper/40 focus:outline-none focus:ring-2 focus:ring-evergreen"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-evergreen text-paper font-medium py-2.5 rounded-sm hover:bg-evergreen-dark transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-ink/60 mt-4">
          New here?{' '}
          <Link to="/register" className="text-evergreen font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
