import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NotificationWire from '../components/NotificationWire';
import { useGeolocation } from '../hooks/useGeolocation';
import { useLiveFeed } from '../hooks/useLiveFeed';

export default function AppLayout() {
  const { position } = useGeolocation();
  const { connected, entries } = useLiveFeed(position);

  return (
    <div className="min-h-screen grain flex flex-col">
      <Navbar connected={connected} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Outlet context={{ origin: position }} />
      </main>
      <NotificationWire entries={entries} />
    </div>
  );
}
