import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import RatingStars from '../components/RatingStars';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    organization: user?.organization || '',
    phone: '',
  });
  const [saved, setSaved] = useState(false);

  const { data: ratings } = useQuery({
    queryKey: ['ratings', user?.id],
    queryFn: async () => (await api.get(`/ratings/user/${user.id}`)).data.ratings,
    enabled: !!user?.id,
  });

  const mutation = useMutation({
    mutationFn: () => api.patch('/auth/me', form),
    onSuccess: (res) => {
      updateUser(res.data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  return (
    <div className="max-w-xl mx-auto">
      <p className="font-mono text-xs uppercase tracking-widest text-evergreen mb-1">account</p>
      <h1 className="font-display font-bold text-2xl text-ink mb-1">Profile</h1>
      <div className="flex items-center gap-2 mb-6">
        <RatingStars value={user?.ratingAverage} count={user?.ratingCount} size="lg" />
        {user?.verified && (
          <span className="text-[10px] font-mono px-2 py-1 bg-evergreen/10 text-evergreen-dark rounded-sm">
            verified
          </span>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="bg-ticket rounded-sm shadow-ticket p-6 space-y-4 mb-8"
      >
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">Full name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-line rounded-sm px-3 py-2 bg-paper/40 focus:outline-none focus:ring-2 focus:ring-evergreen"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">Organization</label>
          <input
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
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

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-evergreen text-paper font-medium py-2.5 rounded-sm hover:bg-evergreen-dark transition-colors disabled:opacity-60"
        >
          {mutation.isPending ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
        </button>
      </form>

      <p className="font-mono text-xs uppercase tracking-widest text-evergreen mb-3">
        ratings received
      </p>
      <div className="space-y-3">
        {(ratings || []).length === 0 && (
          <p className="text-sm text-ink/50">No ratings yet — they'll appear here after your first completed handoff.</p>
        )}
        {(ratings || []).map((r) => (
          <div key={r._id} className="bg-ticket rounded-sm shadow-ticket px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{r.fromUser?.name}</span>
              <RatingStars value={r.stars} showCount={false} />
            </div>
            {r.comment && <p className="text-sm text-ink/70">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
