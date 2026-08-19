// se escala contra el máximo de la lista, no contra el total (no es part-to-whole como el donut)
export default function BarRanking({ items, color = 'var(--color-primary)', ariaLabel, emptyText = 'Todavía no hay datos.' }) {
  if (items.length === 0) return <p className="empty-state">{emptyText}</p>;

  const max = Math.max(...items.map(([, value]) => value));

  return (
    <div className="bar-ranking" role="img" aria-label={ariaLabel}>
      {items.map(([label, value]) => (
        <div className="bar-ranking-row" key={label}>
          <div className="bar-ranking-top">
            <span className="bar-ranking-label" title={label}>
              {label}
            </span>
            <span className="bar-ranking-value">{value}</span>
          </div>
          <div className="bar-ranking-track">
            <div className="bar-ranking-fill" style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}
