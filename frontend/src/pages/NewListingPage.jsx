import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from '../lib/api';

const CATEGORIES = [
  { value: 'cooked', label: 'Cooked meal' },
  { value: 'produce', label: 'Produce' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'packaged', label: 'Packaged goods' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'other', label: 'Other' },
];

const HOURS_OPTIONS = [1, 2, 3, 6, 12, 24, 48];

export default function NewListingPage() {
  const navigate = useNavigate();
  const { origin } = useOutletContext();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'cooked',
    quantity: '',
    hours: 3,
    label: '',
  });
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!origin) {
      setError('We need your location to route this to nearby receivers. Enable location access and try again.');
      return;
    }
    setLoading(true);
    try {
      const expiresAt = new Date(Date.now() + form.hours * 60 * 60 * 1000).toISOString();
      const body = new FormData();
      body.append('title', form.title);
      body.append('description', form.description);
      body.append('category', form.category);
      body.append('quantity', form.quantity);
      body.append('expiresAt', expiresAt);
      body.append('lat', origin.lat);
      body.append('lng', origin.lng);
      body.append('label', form.label || origin.label || '');
      if (photo) body.append('photo', photo);

      const { data } = await api.post('/listings', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/listings/${data.listing._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post this listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <p className="font-mono text-xs uppercase tracking-widest text-evergreen mb-1">new ticket</p>
      <h1 className="font-display font-bold text-2xl text-ink mb-6">Post surplus food</h1>

      <form onSubmit={handleSubmit} className="bg-ticket rounded-sm shadow-ticket p-6 space-y-4">
        {error && (
          <p className="text-sm text-tomato bg-tomato/10 border border-tomato/30 rounded-sm px-3 py-2">
            {error}
          </p>
        )}

        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Vegetable biryani, 15 servings"
            className="w-full border border-line rounded-sm px-3 py-2 bg-paper/40 focus:outline-none focus:ring-2 focus:ring-evergreen"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What it is, how it's packed, anything a receiver should know"
            className="w-full border border-line rounded-sm px-3 py-2 bg-paper/40 focus:outline-none focus:ring-2 focus:ring-evergreen"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-line rounded-sm px-3 py-2 bg-paper/40"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">Quantity</label>
            <input
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="e.g. 5 kg, 20 servings"
              className="w-full border border-line rounded-sm px-3 py-2 bg-paper/40 focus:outline-none focus:ring-2 focus:ring-evergreen"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
            Rescue window
          </label>
          <select
            value={form.hours}
            onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
            className="w-full border border-line rounded-sm px-3 py-2 bg-paper/40"
          >
            {HOURS_OPTIONS.map((h) => (
              <option key={h} value={h}>
                Must be picked up within {h} hour{h > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
            Pickup address <span className="normal-case text-ink/30">(shown to receivers)</span>
          </label>
          <input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="e.g. 14 MG Road, near the bus stand"
            className="w-full border border-line rounded-sm px-3 py-2 bg-paper/40 focus:outline-none focus:ring-2 focus:ring-evergreen"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
            Photo <span className="normal-case text-ink/30">(optional)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-evergreen text-paper font-medium py-2.5 rounded-sm hover:bg-evergreen-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Posting…' : 'Post to the manifest'}
        </button>
      </form>
    </div>
  );
}
