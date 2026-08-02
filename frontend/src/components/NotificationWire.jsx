import { useEffect, useState } from 'react';

let idCounter = 0;

export default function NotificationWire({ entries }) {
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    if (entries.length === 0) return;
    const latest = entries[entries.length - 1];
    const id = idCounter++;
    setVisible((v) => [...v, { ...latest, id }]);
    const timeout = setTimeout(() => {
      setVisible((v) => v.filter((e) => e.id !== id));
    }, 6000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 w-72 max-w-[calc(100vw-2rem)]">
      {visible.map((entry) => (
        <div
          key={entry.id}
          className="bg-ticket border-l-4 border-evergreen shadow-ticket rounded-sm px-3 py-2 animate-[fadeIn_0.2s_ease]"
        >
          <p className="font-mono text-[10px] uppercase tracking-wide text-ink/40">{entry.tag}</p>
          <p className="text-sm text-ink leading-snug">{entry.message}</p>
        </div>
      ))}
    </div>
  );
}
