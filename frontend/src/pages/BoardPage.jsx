import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import TicketCard from '../components/TicketCard';
import MapView from '../components/MapView';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'cooked', label: 'Cooked' },
  { value: 'produce', label: 'Produce' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'packaged', label: 'Packaged' },
  { value: 'dairy', label: 'Dairy' },
];

export default function BoardPage() {
  const { origin } = useOutletContext();
  const [category, setCategory] = useState('');
  const [radiusKm, setRadiusKm] = useState(8);
  const [showMap, setShowMap] = useState(true);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['listings', origin, category, radiusKm],
    queryFn: async () => {
      const { data } = await api.get('/listings', {
        params: { lat: origin?.lat, lng: origin?.lng, category: category || undefined, radiusKm },
      });
      return data.listings;
    },
    enabled: !!origin,
  });

  const listings = data || [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-evergreen mb-1">
            live manifest
          </p>
          <h1 className="font-display font-bold text-2xl text-ink">Surplus near you</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-ticket rounded-sm border border-line p-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-sm transition-colors ${
                  category === c.value ? 'bg-evergreen text-paper' : 'text-ink/60 hover:bg-paper'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-ink/60 font-mono">
            radius
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="border border-line rounded-sm px-2 py-1.5 bg-ticket"
            >
              {[2, 5, 8, 15, 25].map((r) => (
                <option key={r} value={r}>
                  {r} km
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => setShowMap((v) => !v)}
            className="text-xs font-medium px-3 py-1.5 rounded-sm border border-line bg-ticket hover:bg-paper"
          >
            {showMap ? 'Hide map' : 'Show map'}
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${showMap ? 'lg:grid-cols-[1fr_360px]' : ''}`}>
        <div>
          {isLoading && <p className="text-sm text-ink/50 font-mono">Loading manifest…</p>}
          {isError && (
            <p className="text-sm text-tomato">Could not load listings. Is the API server running?</p>
          )}
          {!isLoading && listings.length === 0 && (
            <div className="bg-ticket rounded-sm shadow-ticket p-8 text-center">
              <p className="font-display font-semibold text-lg mb-1">Nothing on the manifest yet</p>
              <p className="text-sm text-ink/60">
                No surplus food is posted within {radiusKm} km right now. Widen the radius or check
                back soon.
              </p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            {listings.map((listing) => (
              <TicketCard key={listing._id} listing={listing} origin={origin} />
            ))}
          </div>
        </div>

        {showMap && (
          <MapView origin={origin} listings={listings} radiusKm={radiusKm} className="h-[420px] lg:h-auto lg:sticky lg:top-24" />
        )}
      </div>
    </div>
  );
}
