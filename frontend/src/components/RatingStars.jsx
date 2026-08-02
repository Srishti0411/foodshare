export default function RatingStars({ value = 0, count = 0, size = 'sm', showCount = true }) {
  const stars = [1, 2, 3, 4, 5];
  const dim = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex">
        {stars.map((s) => (
          <svg
            key={s}
            viewBox="0 0 20 20"
            className={`${dim} ${s <= Math.round(value) ? 'fill-mustard' : 'fill-line'}`}
          >
            <path d="M10 1.5l2.59 5.25 5.79.84-4.19 4.09.99 5.77L10 14.9l-5.18 2.55.99-5.77L1.62 7.6l5.79-.84L10 1.5z" />
          </svg>
        ))}
      </span>
      {showCount && (
        <span className="font-mono text-xs text-ink/60">
          {value > 0 ? value.toFixed(1) : '—'} ({count})
        </span>
      )}
    </span>
  );
}
