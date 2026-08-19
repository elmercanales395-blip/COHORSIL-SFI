import { useMemo } from 'react';
import DonutChart from './DonutChart.jsx';
import BarRanking from './BarRanking.jsx';
import { calcularResumen } from '../../../shared/negocio.util.mjs';

const COLORES_MES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300'];

// top 5 de lo que más se pide y no se logra resolver con un sustituto
function rankingCompetenciaSinConvertir(faltantes) {
  const porProducto = new Map();
  faltantes
    .filter((f) => !f.producto_id && f.producto_solicitado && f.resultado_venta !== 'convertida')
    .forEach((f) => porProducto.set(f.producto_solicitado, (porProducto.get(f.producto_solicitado) || 0) + 1));
  return [...porProducto.entries()].sort(([, a], [, b]) => b - a).slice(0, 5);
}

function rankingCompetencia(faltantes, top = 8) {
  const porProducto = new Map();
  faltantes
    .filter((f) => f.producto_solicitado)
    .forEach((f) => porProducto.set(f.producto_solicitado, (porProducto.get(f.producto_solicitado) || 0) + 1));
  return [...porProducto.entries()].sort(([, a], [, b]) => b - a).slice(0, top);
}

function rankingCohorsil(faltantes, top = 8) {
  const porProducto = new Map();
  faltantes
    .filter((f) => f.producto_codigo)
    .forEach((f) => porProducto.set(f.producto_nombre, (porProducto.get(f.producto_nombre) || 0) + 1));
  return [...porProducto.entries()].sort(([, a], [, b]) => b - a).slice(0, top);
}

// todo esto se calcula en el navegador a partir de los faltantes que ya carga la app, sin pegarle al backend de nuevo
export default function ResumenNegocio({ faltantes }) {
  const {
    total,
    delMes,
    pendientes,
    resueltos,
    tendencia,
    pctPerdidas,
    ventasDecididas,
    rankingCompetenciaSinConvertirLista,
    topCompetencia,
    topCohorsil,
    totalConsultasCompetencia,
    totalConsultasCohorsil,
  } = useMemo(() => {
    const ahora = new Date();
    const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
    const { total, pendientes, resueltos, tendencia } = calcularResumen(faltantes);
    const ventasDecididas = faltantes.filter((f) => f.resultado_venta).length;
    const perdidas = faltantes.filter((f) => f.resultado_venta === 'perdida').length;
    return {
      total,
      delMes: faltantes.filter((f) => f.fecha_registro.slice(0, 7) === mesActual).length,
      pendientes,
      resueltos,
      tendencia: tendencia.slice(-6),
      ventasDecididas,
      pctPerdidas: ventasDecididas > 0 ? Math.round((perdidas / ventasDecididas) * 100) : 0,
      rankingCompetenciaSinConvertirLista: rankingCompetenciaSinConvertir(faltantes),
      topCompetencia: rankingCompetencia(faltantes),
      topCohorsil: rankingCohorsil(faltantes),
      totalConsultasCompetencia: faltantes.filter((f) => f.producto_solicitado).length,
      totalConsultasCohorsil: faltantes.filter((f) => f.producto_codigo).length,
    };
  }, [faltantes]);

  return (
    <>
      <div className="bi-kpi-row">
        <div className="bi-kpi-tile accent-blue">
          <span className="kpi-label">Total de faltantes</span>
          <span className="kpi-value">{total}</span>
          <span className="kpi-sub">Histórico activo</span>
        </div>
        <div className="bi-kpi-tile accent-green">
          <span className="kpi-label">Faltantes del mes</span>
          <span className="kpi-value">{delMes}</span>
          <span className="kpi-sub">Registrados en el mes actual</span>
        </div>
        <div className="bi-kpi-tile accent-amber">
          <span className="kpi-label">Faltantes pendientes</span>
          <span className="kpi-value">{pendientes}</span>
          <span className="kpi-sub">Esperando resolución</span>
        </div>
        <div className="bi-kpi-tile accent-red">
          <span className="kpi-label">Ventas perdidas</span>
          <span className="kpi-value">{pctPerdidas}%</span>
          <span className="kpi-sub">
            {ventasDecididas > 0 ? `De ${ventasDecididas} ventas con sustituto decidido` : 'Todavía sin ventas decididas'}
          </span>
        </div>
      </div>

      <div className="bi-two-col">
        <div className="bi-panel">
          <span className="bi-kicker">Distribución</span>
          <h3 className="bi-panel-title">Faltantes por estado</h3>
          {total === 0 ? (
            <p className="empty-state">Todavía no hay datos.</p>
          ) : (
            <DonutChart
              ariaLabel="Distribución de faltantes por estado"
              segmentos={[
                { label: 'Pendiente', value: pendientes, color: 'var(--color-danger)' },
                { label: 'Resuelto', value: resueltos, color: 'var(--color-accent)' },
              ]}
            />
          )}
        </div>

        <div className="bi-panel">
          <span className="bi-kicker">Tendencia</span>
          <h3 className="bi-panel-title">Faltantes por mes</h3>
          {tendencia.length === 0 ? (
            <p className="empty-state">Todavía no hay datos.</p>
          ) : (
            <DonutChart
              ariaLabel="Distribución de faltantes por mes de registro"
              segmentos={tendencia.map(([mes, cantidad], i) => ({
                label: mes,
                value: cantidad,
                color: COLORES_MES[i % COLORES_MES.length],
              }))}
            />
          )}
        </div>
      </div>

      <div className="bi-panel" style={{ marginBottom: 22 }}>
        <span className="bi-kicker">Balance</span>
        <h3 className="bi-panel-title">Consultas: competencia vs. COHORSIL</h3>
        {totalConsultasCompetencia + totalConsultasCohorsil === 0 ? (
          <p className="empty-state">Todavía no hay datos.</p>
        ) : (
          <DonutChart
            ariaLabel="Proporción de consultas de marcas de la competencia frente a productos propios COHORSIL"
            segmentos={[
              { label: 'Competencia', value: totalConsultasCompetencia, color: 'var(--color-danger)' },
              { label: 'COHORSIL', value: totalConsultasCohorsil, color: 'var(--color-primary)' },
            ]}
          />
        )}
      </div>

      <div className="bi-two-col">
        <div className="bi-panel">
          <span className="bi-kicker">Competencia</span>
          <h3 className="bi-panel-title">Marcas externas más buscadas</h3>
          <BarRanking
            ariaLabel="Ranking de productos de la competencia más consultados"
            items={topCompetencia}
            color="var(--color-danger)"
            emptyText="Todavía no hay consultas de marcas de la competencia."
          />
        </div>

        <div className="bi-panel">
          <span className="bi-kicker">COHORSIL</span>
          <h3 className="bi-panel-title">Productos propios más agotados</h3>
          <BarRanking
            ariaLabel="Ranking de productos COHORSIL más reportados como agotados"
            items={topCohorsil}
            color="var(--color-primary)"
            emptyText="Todavía no hay productos propios reportados."
          />
        </div>
      </div>

      <div className="bi-panel" style={{ marginBottom: 22 }}>
        <span className="bi-kicker">Competencia</span>
        <h3 className="bi-panel-title">Más pedido y sin convertir</h3>
        {rankingCompetenciaSinConvertirLista.length === 0 ? (
          <p className="empty-state">Todavía no hay solicitudes de competencia sin convertir.</p>
        ) : (
          <div className="bi-trend-list">
            {rankingCompetenciaSinConvertirLista.map(([producto, veces]) => (
              <div className="bi-trend-row" key={producto}>
                <span>{producto}</span>
                <strong>{veces} veces</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
