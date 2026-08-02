import { useEffect, useState } from 'react';

function formatRemaining(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function CountdownTimer({ expiresAt, className = '' }) {
  const target = new Date(expiresAt).getTime();
  const [remaining, setRemaining] = useState(target - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const expired = remaining <= 0;
  const urgent = !expired && remaining < 60 * 60 * 1000;

  return (
    <span
      className={`font-mono tabular-nums text-sm ${
        expired ? 'text-ink/40 line-through' : urgent ? 'text-tomato font-semibold' : 'text-evergreen'
      } ${className}`}
    >
      {expired ? 'expired' : formatRemaining(remaining)}
    </span>
  );
}
