import { useEffect, useState } from 'react';

// Falls back to central Delhi if permission is denied, so the app remains
// usable in a demo without a real device location.
const FALLBACK = { lat: 28.6139, lng: 77.209, label: 'Delhi (default)', denied: true };

export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState('locating'); // locating | granted | denied

  useEffect(() => {
    if (!navigator.geolocation) {
      setPosition(FALLBACK);
      setStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: '',
          denied: false,
        });
        setStatus('granted');
      },
      () => {
        setPosition(FALLBACK);
        setStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return { position, status };
}
