import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// default marker icons need to be re-pointed at CDN assets when bundling with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const donorIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapView({ origin, listings, radiusKm, className = '' }) {
  if (!origin) return null;
  const center = [origin.lat, origin.lng];

  return (
    <div className={`rounded-sm overflow-hidden border border-line ${className}`}>
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle center={center} radius={radiusKm * 1000} pathOptions={{ color: '#1F3A2E', fillOpacity: 0.04 }} />
        <Marker position={center}>
          <Popup>You are here</Popup>
        </Marker>
        {listings.map((listing) => {
          const [lng, lat] = listing.location.coordinates;
          return (
            <Marker key={listing._id} position={[lat, lng]} icon={donorIcon}>
              <Popup>
                <strong>{listing.title}</strong>
                <br />
                {listing.quantity}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
