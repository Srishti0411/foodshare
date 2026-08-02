const CONFIG = {
  available: { label: 'Available', color: 'text-evergreen' },
  claimed: { label: 'Claimed', color: 'text-mustard' },
  expired: { label: 'Expired', color: 'text-ink/40' },
  completed: { label: 'Delivered', color: 'text-evergreen-light' },
};

export default function StampBadge({ status, className = '' }) {
  const cfg = CONFIG[status] || CONFIG.available;
  return <span className={`stamp ${cfg.color} ${className}`}>{cfg.label}</span>;
}
