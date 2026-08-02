import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import StampBadge from '../components/StampBadge';
import CountdownTimer from '../components/CountdownTimer';
import RateForm from '../components/RateForm';

function CompletedListingRating({ listingId }) {
  const { data: claim, isLoading } = useQuery({
    queryKey: ['claim-for-listing', listingId],
    queryFn: async () => (await api.get(`/claims/listing/${listingId}`)).data.claim,
  });

  if (isLoading) return <p className="text-xs text-ink/40 font-mono mt-2">Loading claim…</p>;
  if (!claim) return null;

  if (claim.alreadyRatedByMe) {
    return (
      <p className="text-sm text-ink/50 mt-3 pt-3 border-t border-line/70">
        You've already rated this pickup.
      </p>
    );
  }

  return (
    <RateForm
      claimId={claim._id}
      label={`Rate ${claim.receiver?.organization || claim.receiver?.name || 'the receiver'}`}
    />
  );
}

export default function MyListingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: async () => (await api.get('/listings/mine')).data.listings,
  });

  const listings = data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-evergreen mb-1">
            your dispatch history
          </p>
          <h1 className="font-display font-bold text-2xl text-ink">My listings</h1>
        </div>
        <Link
          to="/new-listing"
          className="text-sm font-medium bg-evergreen text-paper px-4 py-2 rounded-sm hover:bg-evergreen-dark"
        >
          Post surplus
        </Link>
      </div>

      {isLoading && <p className="text-sm text-ink/50 font-mono">Loading…</p>}

      {!isLoading && listings.length === 0 && (
        <div className="bg-ticket rounded-sm shadow-ticket p-8 text-center">
          <p className="font-display font-semibold text-lg mb-1">No listings yet</p>
          <p className="text-sm text-ink/60">Post your first surplus item to reach receivers nearby.</p>
        </div>
      )}

      <div className="space-y-3">
        {listings.map((listing) => (
          <div key={listing._id} className="bg-ticket rounded-sm shadow-ticket px-4 py-3">
            <div className="flex items-center justify-between">
              <Link to={`/listings/${listing._id}`} className="hover:text-evergreen-dark">
                <p className="font-mono text-[11px] text-ink/50">{listing.ticketNumber}</p>
                <p className="font-display font-semibold">{listing.title}</p>
                <p className="text-sm text-ink/60 font-mono">{listing.quantity}</p>
              </Link>
              <div className="text-right flex flex-col items-end gap-1 shrink-0 pl-4">
                <StampBadge status={listing.status} />
                {listing.status === 'available' && (
                  <CountdownTimer expiresAt={listing.expiresAt} className="text-xs" />
                )}
              </div>
            </div>

            {listing.status === 'completed' && <CompletedListingRating listingId={listing._id} />}
          </div>
        ))}
      </div>
    </div>
  );
}
