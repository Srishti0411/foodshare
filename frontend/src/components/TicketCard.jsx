import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';
import StampBadge from './StampBadge';
import { distanceKm, formatDistance } from '../lib/geo';

const CATEGORY_LABEL = {
  cooked: 'Cooked meal',
  produce: 'Produce',
  bakery: 'Bakery',
  packaged: 'Packaged',
  dairy: 'Dairy',
  other: 'Other',
};

export default function TicketCard({ listing, origin }) {
  const [lng, lat] = listing.location.coordinates;
  const dist = origin ? distanceKm(origin.lat, origin.lng, lat, lng) : null;

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="group block bg-ticket rounded-sm shadow-ticket hover:-translate-y-0.5 hover:shadow-lg transition-all duration-150"
    >
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <span className="font-mono text-[11px] tracking-wide text-ink/50">
          {listing.ticketNumber}
        </span>
        <div className="flex items-center gap-2">
          {dist !== null && (
            <span className="font-mono text-[11px] px-2 py-0.5 border border-line rounded-sm text-ink/60">
              {formatDistance(dist)}
            </span>
          )}
          <StampBadge status={listing.status} />
        </div>
      </div>

      <div className="ticket-seam mx-4" />

      <div className="p-4 pt-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-evergreen/70 mb-1">
          {CATEGORY_LABEL[listing.category] || 'Other'}
        </p>
        <h3 className="font-display font-semibold text-lg text-ink leading-snug mb-1 group-hover:text-evergreen-dark">
          {listing.title}
        </h3>
        <p className="text-sm text-ink/70 mb-3 line-clamp-2">{listing.description}</p>

        <div className="flex items-center justify-between text-sm">
          <span className="font-mono text-ink/80">{listing.quantity}</span>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-ink/40 mb-0.5">
              {listing.status === 'available' ? 'Rescue by' : 'Status'}
            </p>
            {listing.status === 'available' ? (
              <CountdownTimer expiresAt={listing.expiresAt} />
            ) : (
              <span className="font-mono text-sm text-ink/60 capitalize">{listing.status}</span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-line/70 flex items-center justify-between">
          <span className="text-xs text-ink/60">
            {listing.donor?.organization || listing.donor?.name}
          </span>
          {listing.donor?.verified && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-evergreen/10 text-evergreen-dark rounded-sm">
              verified
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
