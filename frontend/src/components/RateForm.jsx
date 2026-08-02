import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';

export default function RateForm({ claimId, label = 'Rate this person', onDone }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.post('/ratings', { claimId, stars, comment }),
    onSuccess: () => {
      setSubmitted(true);
      onDone?.();
    },
  });

  if (submitted) return <p className="text-sm text-evergreen font-medium">Rating submitted, thank you.</p>;

  return (
    <div className="border-t border-line/70 pt-3 mt-3">
      <p className="text-xs uppercase tracking-wide text-ink/50 mb-2">{label}</p>
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} onClick={() => setStars(s)} type="button">
            <svg
              viewBox="0 0 20 20"
              className={`w-6 h-6 ${s <= stars ? 'fill-mustard' : 'fill-line'}`}
            >
              <path d="M10 1.5l2.59 5.25 5.79.84-4.19 4.09.99 5.77L10 14.9l-5.18 2.55.99-5.77L1.62 7.6l5.79-.84L10 1.5z" />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional note about the handoff"
        rows={2}
        className="w-full border border-line rounded-sm px-3 py-2 bg-paper/40 text-sm mb-2"
      />
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="text-sm font-medium bg-evergreen text-paper px-4 py-1.5 rounded-sm hover:bg-evergreen-dark disabled:opacity-60"
      >
        {mutation.isPending ? 'Submitting…' : 'Submit rating'}
      </button>
      {mutation.isError && (
        <p className="text-xs text-tomato mt-2">
          {mutation.error?.response?.data?.message || 'Could not submit rating.'}
        </p>
      )}
    </div>
  );
}