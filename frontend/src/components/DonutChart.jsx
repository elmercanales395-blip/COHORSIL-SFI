import { useState } from 'react';

// segmentos: [{ label, value, color }]. Hover en un segmento o su fila de leyenda resalta ese
// arco, atenúa el resto y cambia el centro para mostrar su detalle en vez del total.
export default function DonutChart({ segmentos, ariaLabel }) {
  const [hover, setHover] = useState(null);
  const total = segmentos.reduce((acc, s) => acc + s.value, 0);
  const size = 140;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circunferencia = 2 * Math.PI * radius;

  let acumulado = 0;
  const arcos = segmentos.map((s) => {
    const fraccion = total > 0 ? s.value / total : 0;
    const largo = fraccion * circunferencia;
    const offset = circunferencia * (1 - acumulado);
    acumulado += fraccion;
    return { ...s, largo, offset, fraccion };
  });

  const activo = arcos.find((a) => a.label === hover);

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={ariaLabel}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth} />
        {arcos.map((a) =>
          a.value > 0 ? (
            <circle
              key={a.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={a.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${a.largo} ${circunferencia - a.largo}`}
              strokeDashoffset={a.offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="donut-arco"
              style={{ opacity: hover && hover !== a.label ? 0.4 : 1 }}
              tabIndex={0}
              onMouseEnter={() => setHover(a.label)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(a.label)}
              onBlur={() => setHover(null)}
            >
              <title>{`${a.label}: ${a.value} (${total > 0 ? Math.round(a.fraccion * 100) : 0}%)`}</title>
            </circle>
          ) : null,
        )}
        {activo ? (
          <>
            <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" className="donut-total">
              {activo.value}
            </text>
            <text x="50%" y="64%" textAnchor="middle" dominantBaseline="central" className="donut-hover-label">
              {activo.label}
            </text>
          </>
        ) : (
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="donut-total">
            {total}
          </text>
        )}
      </svg>

      <div className="donut-legend">
        {arcos.map((a) => (
          <div
            className={`donut-legend-row${hover === a.label ? ' is-hovered' : ''}`}
            key={a.label}
            onMouseEnter={() => setHover(a.label)}
            onMouseLeave={() => setHover(null)}
          >
            <div className="donut-legend-top">
              <span className="donut-legend-label">
                <span className="donut-legend-dot" style={{ background: a.color }} />
                {a.label}
                <span className="donut-legend-pct">{total > 0 ? Math.round(a.fraccion * 100) : 0}%</span>
              </span>
              <span className="donut-legend-value">{a.value}</span>
            </div>
            <div className="donut-legend-bar-track">
              <div className="donut-legend-bar-fill" style={{ width: `${a.fraccion * 100}%`, background: a.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
