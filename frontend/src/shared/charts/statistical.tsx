// Gráficos estatísticos / de distribuição: bolhas (freq × volume × ticket),
// dispersão de anomalias, radar por dia da semana e box plot por categoria.
import {
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { axisStyle, brl, brlCompact, chartColors, gridStroke, palette } from '@/shared/theme/tokens';
import { anomalias, bolhasCategorias, boxplotCategorias, meses, radarDiaSemana } from '@/data/mock';
import { MiniTooltip, ResponsiveWrap, fmtMes } from './shared';

// ===== Frequência × volume × ticket (bolhas) =====
function BolhaTip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-graphite bg-obsidian/95 px-3 py-2 text-xs shadow-tremor-dropdown">
      <div className="font-semibold text-bone">{d.categoria}</div>
      <div className="text-ash">{d.transacoes} transações</div>
      <div className="value text-bone">{brl(d.volume)} · ticket {brl(d.ticket)}</div>
    </div>
  );
}
export function BolhasScatter() {
  return (
    <ResponsiveWrap height={300}>
      <ScatterChart margin={{ top: 8, right: 16, left: 8, bottom: 16 }}>
        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
        <XAxis type="number" dataKey="transacoes" name="Transações" {...axisStyle} label={{ value: 'Nº de transações', position: 'insideBottom', offset: -8, fill: palette.ash, fontSize: 11 }} />
        <YAxis type="number" dataKey="volume" name="Volume" tickFormatter={brlCompact} width={56} {...axisStyle} />
        <ZAxis type="number" dataKey="ticket" range={[120, 1400]} name="Ticket médio" />
        <Tooltip cursor={{ strokeDasharray: '3 3', stroke: palette.steel }} content={<BolhaTip />} />
        <Scatter data={bolhasCategorias} isAnimationActive={false}>
          {bolhasCategorias.map((_, i) => (
            <Cell key={i} fill={chartColors[i % chartColors.length]} fillOpacity={0.8} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveWrap>
  );
}

// ===== Gastos por dia da semana (radar) =====
export function RadarDiaSemana() {
  return (
    <ResponsiveWrap>
      <RadarChart data={radarDiaSemana} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <PolarGrid stroke={palette.graphite} />
        <PolarAngleAxis dataKey="dia" tick={{ fill: palette.ash, fontSize: 11 }} />
        <PolarRadiusAxis angle={90} tick={{ fill: palette.steel, fontSize: 9 }} stroke={palette.graphite} />
        <Tooltip content={<MiniTooltip />} />
        <Radar name="Gasto" dataKey="valor" stroke={palette.ember} strokeWidth={2} fill={palette.crimson} fillOpacity={0.35} isAnimationActive={false} />
      </RadarChart>
    </ResponsiveWrap>
  );
}

// ===== Detecção de anomalias (scatter) =====
export function AnomaliasScatter() {
  const normais = anomalias.filter((a) => !a.anomalia);
  const anom = anomalias.filter((a) => a.anomalia);
  return (
    <ResponsiveWrap height={300}>
      <ScatterChart margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
        <XAxis type="number" dataKey="x" domain={[0, 13]} ticks={[0, 3, 6, 9, 12]} tickFormatter={(v) => fmtMes(meses[Math.min(12, Math.round(v))])} {...axisStyle} />
        <YAxis type="number" dataKey="valor" tickFormatter={brlCompact} width={56} {...axisStyle} />
        <Tooltip cursor={{ strokeDasharray: '3 3', stroke: palette.steel }} content={<MiniTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Scatter name="Normais" data={normais} fill={palette.info} fillOpacity={0.5} isAnimationActive={false} />
        <Scatter name="Anomalias" data={anom} fill={palette.ember} isAnimationActive={false} />
      </ScatterChart>
    </ResponsiveWrap>
  );
}

// ===== Distribuição estatística por categoria (box plot, SVG) =====
export function BoxPlotCategorias() {
  const W = 720;
  const H = 280;
  const padL = 48;
  const padB = 50;
  const padT = 12;
  const todos = boxplotCategorias.flatMap((c) => [c.max, ...c.outliers]);
  const max = Math.max(...todos) * 1.05;
  const yScale = (v: number) => padT + (H - padT - padB) * (1 - v / max);
  const stepX = (W - padL) / boxplotCategorias.length;
  const boxW = Math.min(36, stepX * 0.5);
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={280}>
        {/* eixo Y */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const v = max * t;
          const y = yScale(v);
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W} y2={y} stroke={gridStroke} strokeDasharray="3 3" />
              <text x={padL - 6} y={y + 3} textAnchor="end" fill={palette.ash} fontSize={10} fontFamily='"IBM Plex Mono", monospace'>{brlCompact(v)}</text>
            </g>
          );
        })}
        {boxplotCategorias.map((c, i) => {
          const cx = padL + stepX * (i + 0.5);
          const cor = chartColors[i % chartColors.length];
          return (
            <g key={c.categoria}>
              {/* whiskers */}
              <line x1={cx} y1={yScale(c.max)} x2={cx} y2={yScale(c.min)} stroke={palette.steel} strokeWidth={1} />
              <line x1={cx - 8} y1={yScale(c.max)} x2={cx + 8} y2={yScale(c.max)} stroke={palette.steel} />
              <line x1={cx - 8} y1={yScale(c.min)} x2={cx + 8} y2={yScale(c.min)} stroke={palette.steel} />
              {/* caixa q1-q3 */}
              <rect x={cx - boxW / 2} y={yScale(c.q3)} width={boxW} height={Math.max(1, yScale(c.q1) - yScale(c.q3))} fill={cor} fillOpacity={0.4} stroke={cor} strokeWidth={1.5} />
              {/* mediana */}
              <line x1={cx - boxW / 2} y1={yScale(c.mediana)} x2={cx + boxW / 2} y2={yScale(c.mediana)} stroke={palette.bone} strokeWidth={2} />
              {/* outliers */}
              {c.outliers.map((o, k) => (
                <circle key={k} cx={cx} cy={yScale(o)} r={2.5} fill={cor} />
              ))}
              {/* rótulo */}
              <text x={cx} y={H - padB + 16} textAnchor="end" transform={`rotate(-30 ${cx} ${H - padB + 16})`} fill={palette.ash} fontSize={10}>{c.categoria}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
