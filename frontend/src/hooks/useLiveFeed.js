import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../lib/socket';
import { useAuthStore } from '../store/useAuthStore';

export function useLiveFeed(origin) {
  const { user } = useAuthStore();
  const [connected, setConnected] = useState(false);
  const [entries, setEntries] = useState([]);
  const queryClient = useQueryClient();
  const originRef = useRef(origin);
  originRef.current = origin;

  useEffect(() => {
    if (!user) return undefined;
    const socket = getSocket();
    socket.connect();

    const onConnect = () => {
      setConnected(true);
      socket.emit('identify', user.id);
      if (originRef.current) {
        socket.emit('subscribe:area', originRef.current);
      }
    };
    const onDisconnect = () => setConnected(false);

    const push = (tag, message) => setEntries((prev) => [...prev.slice(-19), { tag, message }]);

    const onNewListing = (listing) => {
      push('new listing', `${listing.title} posted nearby`);
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    };
    const onClaimed = (payload) => {
      push('claimed', `${payload.receiverName} claimed "${payload.title}"`);
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', payload.listingId] });
    };
    const onReopened = (payload) => {
      push('reopened', `"${payload.title}" is available again`);
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    };
    const onExpired = (payload) => {
      push('expired', `"${payload.title}" passed its rescue window`);
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('listing:new', onNewListing);
    socket.on('listing:claimed', onClaimed);
    socket.on('listing:reopened', onReopened);
    socket.on('listing:expired', onExpired);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('listing:new', onNewListing);
      socket.off('listing:claimed', onClaimed);
      socket.off('listing:reopened', onReopened);
      socket.off('listing:expired', onExpired);
      socket.disconnect();
    };
  }, [user, queryClient]);

  useEffect(() => {
    if (connected && origin) {
      getSocket().emit('subscribe:area', origin);
    }
  }, [connected, origin]);

  return { connected, entries };
}
