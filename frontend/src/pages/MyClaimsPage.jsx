import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import CountdownTimer from '../components/CountdownTimer';

function RateForm({ claimId, onDone }) {
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
      <p className="text-xs uppercase tracking-wide text-ink/50 mb-2">Rate this donor</p>
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
    </div>
  );
}

export default function MyClaimsPage() {
  const queryClient = useQueryClient();
  const [rated, setRated] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['my-claims'],
    queryFn: async () => (await api.get('/claims/mine')).data.claims,
  });

  const confirmMutation = useMutation({
    mutationFn: (claimId) => api.patch(`/claims/${claimId}/confirm`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-claims'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (claimId) => api.patch(`/claims/${claimId}/cancel`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-claims'] }),
  });

  const claims = data || [];

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-evergreen mb-1">
        pickups in progress
      </p>
      <h1 className="font-display font-bold text-2xl text-ink mb-6">My claims</h1>

      {isLoading && <p className="text-sm text-ink/50 font-mono">Loading…</p>}

      {!isLoading && claims.length === 0 && (
        <div className="bg-ticket rounded-sm shadow-ticket p-8 text-center">
          <p className="font-display font-semibold text-lg mb-1">No active claims</p>
          <p className="text-sm text-ink/60">
            Browse the{' '}
            <Link to="/board" className="text-evergreen underline">
              manifest
            </Link>{' '}
            to claim surplus food nearby.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {claims.map((claim) => (
          <div key={claim._id} className="bg-ticket rounded-sm shadow-ticket p-4">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="font-mono text-[11px] text-ink/50">{claim.listing?.ticketNumber}</p>
                <Link to={`/listings/${claim.listing?._id}`} className="font-display font-semibold hover:text-evergreen">
                  {claim.listing?.title}
                </Link>
              </div>
              <span className="text-xs font-mono text-ink/60">
                {claim.pickupConfirmed ? 'picked up' : 'awaiting pickup'}
              </span>
            </div>

            <p className="text-sm text-ink/70 mb-2">
              From {claim.listing?.donor?.organization || claim.listing?.donor?.name}
              {claim.listing?.donor?.phone && ` · ${claim.listing.donor.phone}`}
            </p>
            <p className="text-sm text-ink/60 mb-2">{claim.listing?.location?.label}</p>

            {!claim.pickupConfirmed && claim.listing && (
              <div className="flex items-center gap-3">
                <CountdownTimer expiresAt={claim.listing.expiresAt} className="text-xs" />
                <button
                  onClick={() => confirmMutation.mutate(claim._id)}
                  className="text-sm font-medium bg-evergreen text-paper px-3 py-1.5 rounded-sm hover:bg-evergreen-dark"
                >
                  Confirm pickup
                </button>
                <button
                  onClick={() => cancelMutation.mutate(claim._id)}
                  className="text-sm font-medium text-tomato px-3 py-1.5 rounded-sm border border-tomato/40 hover:bg-tomato/10"
                >
                  Cancel claim
                </button>
              </div>
            )}

            {claim.pickupConfirmed && (claim.alreadyRatedByMe || rated[claim._id]) && (
              <p className="text-sm text-ink/50 mt-3 pt-3 border-t border-line/70">
                You've already rated this pickup.
              </p>
            )}

            {claim.pickupConfirmed && !claim.alreadyRatedByMe && !rated[claim._id] && (
              <RateForm
                claimId={claim._id}
                label="Rate this donor"
                onDone={() => setRated((r) => ({ ...r, [claim._id]: true }))}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
