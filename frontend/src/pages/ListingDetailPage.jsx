import { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import StampBadge from '../components/StampBadge';
import CountdownTimer from '../components/CountdownTimer';
import RatingStars from '../components/RatingStars';
import { distanceKm, formatDistance } from '../lib/geo';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { origin } = useOutletContext();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [claimError, setClaimError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => (await api.get(`/listings/${id}`)).data.listing,
  });

  const claimMutation = useMutation({
    mutationFn: () => api.post(`/listings/${id}/claim`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-claims'] });
    },
    onError: (err) => setClaimError(err.response?.data?.message || 'Could not claim this listing.'),
  });

  const withdrawMutation = useMutation({
    mutationFn: () => api.delete(`/listings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      navigate('/my-listings');
    },
  });

  if (isLoading) return <p className="text-sm text-ink/50 font-mono">Loading ticket…</p>;
  if (!data) return <p className="text-sm text-tomato">Listing not found.</p>;

  const [lng, lat] = data.location.coordinates;
  const dist = origin ? distanceKm(origin.lat, origin.lng, lat, lng) : null;
  const isOwnListing = user?.id === data.donor?._id;
  const canClaim = user?.role === 'receiver' && data.status === 'available';

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-ink/60 hover:text-evergreen mb-4">
        ← Back to manifest
      </button>

      <div className="bg-ticket rounded-sm shadow-ticket overflow-hidden">
        {data.photo && (
          <img src={data.photo} alt={data.title} className="w-full h-56 object-cover" />
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <span className="font-mono text-xs text-ink/50">{data.ticketNumber}</span>
            <StampBadge status={data.status} />
          </div>

          <p className="font-mono text-[11px] uppercase tracking-widest text-evergreen/70 mb-1">
            {data.category}
          </p>
          <h1 className="font-display font-bold text-2xl text-ink mb-2">{data.title}</h1>
          <p className="text-ink/70 mb-5">{data.description}</p>

          <div className="ticket-seam mb-5" />

          <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-ink/40 mb-0.5">Quantity</p>
              <p className="font-mono">{data.quantity}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-ink/40 mb-0.5">
                {data.status === 'available' ? 'Rescue by' : 'Status'}
              </p>
              {data.status === 'available' ? (
                <CountdownTimer expiresAt={data.expiresAt} />
              ) : (
                <span className="font-mono text-sm text-ink/60">
                  {data.status === 'completed' && 'picked up'}
                  {data.status === 'claimed' && 'awaiting pickup'}
                  {data.status === 'expired' && 'window passed'}
                </span>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-ink/40 mb-0.5">Pickup location</p>
              <p className="text-ink/80">{data.location.label || 'Shared after claiming'}</p>
            </div>
            {dist !== null && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-ink/40 mb-0.5">Distance</p>
                <p className="font-mono">{formatDistance(dist)}</p>
              </div>
            )}
          </div>

          <div className="border-t border-line/70 pt-4 mb-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-ink">{data.donor?.organization || data.donor?.name}</p>
              <RatingStars value={data.donor?.ratingAverage} count={data.donor?.ratingCount} />
            </div>
            {data.donor?.verified && (
              <span className="text-[10px] font-mono px-2 py-1 bg-evergreen/10 text-evergreen-dark rounded-sm">
                verified NGO partner
              </span>
            )}
          </div>

          {claimError && (
            <p className="text-sm text-tomato bg-tomato/10 border border-tomato/30 rounded-sm px-3 py-2 mb-4">
              {claimError}
            </p>
          )}

          {canClaim && (
            <button
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              className="w-full bg-tomato text-paper font-medium py-3 rounded-sm hover:bg-tomato-dark transition-colors disabled:opacity-60"
            >
              {claimMutation.isPending ? 'Claiming…' : 'Claim this listing'}
            </button>
          )}

          {data.status === 'claimed' && data.claimedBy && (
            <p className="text-sm text-ink/60 bg-mustard/10 border border-mustard/30 rounded-sm px-3 py-2">
              Claimed by {data.claimedBy.name}
              {user?.id === data.claimedBy._id ? ' (you)' : ''} — coordinate pickup directly.
            </p>
          )}

          {isOwnListing && data.status === 'available' && (
            <button
              onClick={() => withdrawMutation.mutate()}
              disabled={withdrawMutation.isPending}
              className="w-full mt-3 border border-line text-ink/70 font-medium py-2.5 rounded-sm hover:bg-paper transition-colors"
            >
              Withdraw listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
