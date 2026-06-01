import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Sankey,
  Scatter,
  ScatterChart,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { axisStyle, brl, brlCompact, chartColors, gridStroke, niceAxis, palette } from '../theme/tokens';
import {
  anomalias,
  bolhasCategorias,
  comprometimento,
  diasSemana,
  evolucaoMensal,
  heatCategorias,
  heatmapCatMes,
  hierarquiaExterna,
  hierarquiaInterna,
  horarioPico,
  horas,
  mediaMensalCategorias,
  meses,
  metodoPagamento,
  radarDiaSemana,
  receitasDespesas,
  sankeyData,
  seriesMediaMensal,
  treemapCategorias,
  waterfall,
  boxplotCategorias,
} from '../data/mock';

// ===== Helpers =====
const fmtMes = (m: string) => m.slice(5) + '/' + m.slice(2, 4); // 2025-07 -> 07/25

function MiniTooltip({ active, payload, label, unidade = 'brl' }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-graphite bg-obsidian/95 px-3 py-2 shadow-tremor-dropdown">
      {label != null && <div className="label-stencil mb-1 text-[0.6rem]">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color || p.fill || p.stroke }} />
          <span className="text-ash">{p.name}</span>
          <span className="value ml-auto text-bone">
            {unidade === 'brl' ? brl(Math.abs(p.value)) : `${p.value}`}
          </span>
        </div>
      ))}
    </div>
  );
}

// rampa de cor void/aço -> ember (para heatmaps)
function rampEmber(t: number) {
  const a = [22, 25, 31];
  const b = [240, 58, 36];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, t))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// ===== 1. Receitas vs Despesas (rosca, %) =====
export function ReceitasDespesasDonut() {
  const cores = [palette.gain, palette.loss];
  return (
    <ResponsiveWrap>
      <PieChart>
        <Tooltip content={<MiniTooltip unidade="pct" />} />
        <Pie data={receitasDespesas} dataKey="valor" nameKey="nome" innerRadius={56} outerRadius={84} paddingAngle={2} stroke={palette.void} strokeWidth={2} isAnimationActive={false}
          label={({ percent }: any) => `${(percent * 100).toFixed(1)}%`}>
          {receitasDespesas.map((_, i) => (
            <Cell key={i} fill={cores[i]} />
          ))}
        </Pie>
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveWrap>
  );
}

// ===== 2. Evolução temporal Receitas × Despesas (área) =====
export function EvolucaoArea() {
  const max = Math.max(...evolucaoMensal.map((d) => Math.max(d.receitas, d.despesas)));
  const { domainMax, ticks } = niceAxis(max);
  return (
    <ResponsiveWrap>
      <AreaChart data={evolucaoMensal} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.gain} stopOpacity={0.4} />
            <stop offset="100%" stopColor={palette.gain} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gDes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.loss} stopOpacity={0.35} />
            <stop offset="100%" stopColor={palette.loss} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mes" tickFormatter={fmtMes} {...axisStyle} />
        <YAxis domain={[0, domainMax]} ticks={ticks} tickFormatter={brlCompact} width={64} {...axisStyle} />
        <Tooltip content={<MiniTooltip />} cursor={{ stroke: palette.steel }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" name="Receitas" dataKey="receitas" stroke={palette.gain} strokeWidth={2} fill="url(#gRec)" isAnimationActive={false} dot={{ r: 2, fill: palette.gain }} />
        <Area type="monotone" name="Despesas" dataKey="despesas" stroke={palette.loss} strokeWidth={2} fill="url(#gDes)" isAnimationActive={false} dot={{ r: 2, fill: palette.loss }} />
      </AreaChart>
    </ResponsiveWrap>
  );
}

// ===== 3. Comparativo mensal — barras + linha do saldo (eixo único, marcas dinâmicas) =====
export function ComparativoComposed() {
  // eixo único para barras E linha: as alturas batem com os números.
  const max = Math.max(...evolucaoMensal.map((d) => Math.max(d.receitas, d.despesas, d.saldo)));
  const { domainMax, ticks } = niceAxis(max);
  return (
    <ResponsiveWrap height={300}>
      <ComposedChart data={evolucaoMensal} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mes" tickFormatter={fmtMes} {...axisStyle} />
        <YAxis domain={[0, domainMax]} ticks={ticks} tickFormatter={brlCompact} width={56} {...axisStyle} />
        <Tooltip content={<MiniTooltip />} cursor={{ fill: '#ffffff08' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar name="Receitas" dataKey="receitas" fill={palette.gain} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        <Bar name="Despesas" dataKey="despesas" fill={palette.loss} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        <Line name="Saldo líquido" type="monotone" dataKey="saldo" stroke={palette.brass} strokeWidth={2.5} dot={{ r: 3, fill: palette.brass }} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveWrap>
  );
}

// rótulo de eixo X com ângulo FIXO para todos (padroniza a angulação)
function AngledTick({ x, y, payload }: any) {
  return (
    <text
      x={x}
      y={y + 10}
      textAnchor="end"
      transform={`rotate(-35 ${x} ${y + 10})`}
      fill={palette.ash}
      fontSize={12}
    >
      {payload.value}
    </text>
  );
}

// ===== 4. Composição do saldo (waterfall) =====
export function WaterfallChart() {
  let running = 0;
  const data = waterfall.map((step) => {
    if (step.tipo === 'total') {
      running = step.valor;
      return { nome: step.nome, base: 0, barra: step.valor, tipo: step.tipo, valorReal: step.valor };
    }
    const start = running;
    const end = running + step.valor;
    running = end;
    return { nome: step.nome, base: end, barra: start - end, tipo: step.tipo, valorReal: step.valor };
  });
  const Tip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="rounded-md border border-graphite bg-obsidian/95 px-3 py-2 text-xs shadow-tremor-dropdown">
        <div className="text-ash">{d.nome}</div>
        <div className="value text-bone">{brl(d.valorReal)}</div>
      </div>
    );
  };
  return (
    <ResponsiveWrap height={300}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 12, bottom: 28 }}>
        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="nome" interval={0} height={84} tick={<AngledTick />} axisLine={{ stroke: palette.graphite }} tickLine={{ stroke: palette.graphite }} />
        <YAxis tickFormatter={brlCompact} width={84} {...axisStyle} />
        <Tooltip content={<Tip />} cursor={{ fill: '#ffffff08' }} />
        <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="barra" stackId="w" radius={[3, 3, 0, 0]} isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.tipo === 'total' ? palette.info : palette.loss} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveWrap>
  );
}

// ===== 5. Treemap por categoria =====
function TreemapCell(props: any) {
  const { x, y, width, height, index, name, value } = props;
  const fill = chartColors[index % chartColors.length];
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke={palette.void} strokeWidth={2} />
      {width > 60 && height > 28 && (
        <>
          <text x={x + 6} y={y + 16} fill={palette.void} fontSize={11} fontWeight={600}>{name}</text>
          <text x={x + 6} y={y + 30} fill={palette.void} fontSize={10} fontFamily='"IBM Plex Mono", monospace'>{brlCompact(value)}</text>
        </>
      )}
    </g>
  );
}
export function CategoriaTreemap() {
  return (
    <ResponsiveWrap>
      <Treemap data={treemapCategorias} dataKey="valor" nameKey="nome" stroke={palette.void} isAnimationActive={false} content={<TreemapCell />} />
    </ResponsiveWrap>
  );
}

// ===== 6. Hierarquia de gastos (sunburst via 2 anéis) =====
export function HierarquiaSunburst() {
  const coresInternas: Record<string, string> = { 'Crédito': palette.gain, 'Débito': palette.info };
  return (
    <ResponsiveWrap>
      <PieChart>
        <Tooltip content={<MiniTooltip unidade="pct" />} />
        <Pie data={hierarquiaInterna} dataKey="valor" nameKey="nome" outerRadius={52} stroke={palette.void} strokeWidth={2} isAnimationActive={false}
          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
          {hierarquiaInterna.map((d, i) => (
            <Cell key={i} fill={coresInternas[d.nome]} />
          ))}
        </Pie>
        <Pie data={hierarquiaExterna} dataKey="valor" nameKey="nome" innerRadius={58} outerRadius={88} stroke={palette.void} strokeWidth={2} isAnimationActive={false}>
          {hierarquiaExterna.map((_, i) => (
            <Cell key={i} fill={chartColors[i % chartColors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveWrap>
  );
}

// ===== 7 & 14. Heatmap genérico (grid) =====
export function HeatmapGrid({
  rows,
  cols,
  matrix,
  colTick = 1,
}: {
  rows: string[];
  cols: string[];
  matrix: number[][];
  colTick?: number;
}) {
  const max = Math.max(1, ...matrix.flat());
  return (
    <div className="overflow-x-auto">
      <div className="grid gap-1" style={{ gridTemplateColumns: `84px repeat(${cols.length}, minmax(10px, 1fr))` }}>
        {rows.map((rowLabel, r) => (
          <div className="contents" key={r}>
            <div className="flex items-center justify-end pr-2 text-[0.7rem] text-ash">{rowLabel}</div>
            {matrix[r].map((v, c) => (
              <div key={c} className="h-6 rounded-[2px]" style={{ background: rampEmber(v / max) }} title={`${rowLabel} · ${cols[c]}: ${v}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-1 grid gap-1" style={{ gridTemplateColumns: `84px repeat(${cols.length}, minmax(10px, 1fr))` }}>
        <div />
        {cols.map((c, i) => (
          <div key={i} className="text-center text-[0.55rem] text-steel">{i % colTick === 0 ? c : ''}</div>
        ))}
      </div>
    </div>
  );
}

export function HeatmapCatMes() {
  return <HeatmapGrid rows={heatCategorias} cols={meses.map(fmtMes)} matrix={heatmapCatMes} />;
}
export function HorarioPicoHeatmap() {
  return <HeatmapGrid rows={diasSemana} cols={horas.map((h) => `${h}h`)} matrix={horarioPico} colTick={3} />;
}

// ===== 8. Frequência × volume × ticket (bolhas) =====
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

// ===== 9. Gastos por dia da semana (radar) =====
export function RadarDiaSemana() {
  return (
    <ResponsiveWrap>
      <RadarChart data={radarDiaSemana} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <PolarGrid stroke={palette.graphite} />
        <PolarAngleAxis dataKey="dia" tick={{ fill: palette.ash, fontSize: 11 }} />
        <PolarRadiusAxis tick={{ fill: palette.steel, fontSize: 9 }} stroke={palette.graphite} />
        <Tooltip content={<MiniTooltip />} />
        <Radar name="Gasto" dataKey="valor" stroke={palette.ember} strokeWidth={2} fill={palette.crimson} fillOpacity={0.35} isAnimationActive={false} />
      </RadarChart>
    </ResponsiveWrap>
  );
}

// ===== 10. Evolução da média mensal por categoria (multi-linha) =====
export function MediaMensalLinhas() {
  return (
    <ResponsiveWrap height={300}>
      <LineChart data={mediaMensalCategorias} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mes" tickFormatter={fmtMes} {...axisStyle} />
        <YAxis tickFormatter={brlCompact} width={56} {...axisStyle} />
        <Tooltip content={<MiniTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {seriesMediaMensal.map((s, i) => (
          <Line key={s} type="monotone" name={s} dataKey={s} stroke={chartColors[i % chartColors.length]} strokeWidth={2} dot={false} isAnimationActive={false} />
        ))}
      </LineChart>
    </ResponsiveWrap>
  );
}

// ===== 11. Distribuição estatística por categoria (box plot, SVG) =====
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

// ===== 12. Gauge de comprometimento de receita (SVG) =====
const polar = (cx: number, cy: number, r: number, deg: number) => ({
  x: cx + r * Math.cos((deg * Math.PI) / 180),
  y: cy - r * Math.sin((deg * Math.PI) / 180),
});
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polar(cx, cy, r, startDeg);
  const e = polar(cx, cy, r, endDeg);
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}
export function GaugeComprometimento() {
  const cx = 130;
  const cy = 130;
  const r = 92;
  const pct = comprometimento.pct;
  const ang = 180 - (pct / 100) * 180; // 0% -> 180°(esq), 100% -> 0°(dir)
  const ponta = polar(cx, cy, r - 22, ang);
  // zonas: verde 0-50, âmbar 50-80, vermelho 80-100 (em graus: 180->90->54->0)
  const zonas: [number, number, string][] = [
    [180, 90, palette.gain],
    [90, 54, palette.warning],
    [54, 0, palette.loss],
  ];
  return (
    <svg viewBox="0 0 260 170" width="100%" height={170}>
      {zonas.map(([a, b, cor], i) => (
        <path key={i} d={arcPath(cx, cy, r, b, a)} fill="none" stroke={cor} strokeWidth={14} strokeLinecap="butt" />
      ))}
      {/* ponteiro */}
      <line x1={cx} y1={cy} x2={ponta.x} y2={ponta.y} stroke={palette.bone} strokeWidth={3} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={6} fill={palette.ember} />
      {/* extremos */}
      <text x={cx - r} y={cy + 18} textAnchor="middle" fill={palette.steel} fontSize={11} fontFamily='"IBM Plex Mono", monospace'>0</text>
      <text x={cx + r} y={cy + 18} textAnchor="middle" fill={palette.steel} fontSize={11} fontFamily='"IBM Plex Mono", monospace'>100</text>
      {/* valor */}
      <text x={cx} y={cy + 32} textAnchor="middle" fill={palette.bone} fontSize={26} fontWeight={700} fontFamily='"IBM Plex Mono", monospace'>{pct.toFixed(1)}%</text>
      <text x={cx} y={cy + 48} textAnchor="middle" fill={palette.ash} fontSize={10}>% comprometido</text>
    </svg>
  );
}

// ===== 13. Detecção de anomalias (scatter) =====
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

// ===== 15. Distribuição por método de pagamento (rosca) =====
export function MetodoPagamentoDonut() {
  return (
    <ResponsiveWrap>
      <PieChart>
        <Tooltip content={<MiniTooltip unidade="pct" />} />
        <Pie data={metodoPagamento} dataKey="valor" nameKey="metodo" innerRadius={56} outerRadius={84} paddingAngle={2} stroke={palette.void} strokeWidth={2} isAnimationActive={false}
          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {metodoPagamento.map((_, i) => (
            <Cell key={i} fill={chartColors[i % chartColors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveWrap>
  );
}

// ===== 16. Fluxo financeiro (sankey) =====
function SankeyNode({ x, y, width, height, payload }: any) {
  const ehFonte = x < 100;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={palette.crimson} fillOpacity={0.85} rx={1} />
      <text x={ehFonte ? x + width + 6 : x - 6} y={y + height / 2} textAnchor={ehFonte ? 'start' : 'end'} dominantBaseline="middle" fill={palette.bone} fontSize={10}>
        {payload.name}
      </text>
    </g>
  );
}
export function FluxoSankey() {
  return (
    <ResponsiveWrap height={360}>
      <Sankey data={sankeyData} nodePadding={18} nodeWidth={10} linkCurvature={0.5} iterations={32}
        node={<SankeyNode />} link={{ stroke: palette.steel, strokeOpacity: 0.25 }} margin={{ top: 8, right: 90, bottom: 8, left: 70 }}>
        <Tooltip content={<MiniTooltip />} />
      </Sankey>
    </ResponsiveWrap>
  );
}

// ===== Wrapper de ResponsiveContainer =====
import { ResponsiveContainer } from 'recharts';
import type { ReactElement } from 'react';
function ResponsiveWrap({ children, height = 260 }: { children: ReactElement; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  );
}
