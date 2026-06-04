// Gráficos básicos do painel: saldo (área), fluxo (barras divergentes),
// gasto por categoria (barra) e rosca, projeção (3 cenários).
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  axisStyle,
  brl,
  brlCompact,
  chartColors,
  gridStroke,
  palette,
} from '@/shared/theme/tokens';
import {
  balanceSeries,
  cashflow,
  categorias,
  projecao,
} from '@/data/mock';
import { DarkTooltip } from './shared';

// ===== Saldo ao longo do tempo (área) =====
export function BalanceArea() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={balanceSeries} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="fillSaldo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.ember} stopOpacity={0.35} />
            <stop offset="100%" stopColor={palette.ember} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mes" {...axisStyle} />
        <YAxis tickFormatter={brlCompact} width={64} {...axisStyle} />
        <Tooltip content={<DarkTooltip />} cursor={{ stroke: palette.steel }} />
        <Area
          type="monotone"
          name="Saldo"
          dataKey="saldo"
          stroke={palette.ember}
          strokeWidth={2}
          fill="url(#fillSaldo)"
          isAnimationActive={false}
          activeDot={{ r: 4, fill: palette.emberGlow, stroke: palette.void }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ===== Entrada × saída (barras divergentes) =====
export function CashflowBars() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={cashflow} stackOffset="sign" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mes" {...axisStyle} />
        <YAxis tickFormatter={brlCompact} width={64} {...axisStyle} />
        <Tooltip content={<DarkTooltip />} cursor={{ fill: '#ffffff08' }} />
        <ReferenceLine y={0} stroke={palette.steel} />
        <Bar name="Receita" dataKey="receita" fill={palette.gain} radius={[3, 3, 0, 0]} stackId="fluxo" isAnimationActive={false} />
        <Bar name="Despesa" dataKey="despesa" fill={palette.loss} radius={[0, 0, 3, 3]} stackId="fluxo" isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ===== Gasto por categoria (barra horizontal) =====
export function CategoryBar() {
  const data = [...categorias].sort((a, b) => b.valor - a.valor);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart layout="vertical" data={data} margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={brlCompact} {...axisStyle} />
        <YAxis type="category" dataKey="nome" width={92} {...axisStyle} />
        <Tooltip content={<DarkTooltip />} cursor={{ fill: '#ffffff08' }} />
        <Bar name="Gasto" dataKey="valor" radius={[0, 3, 3, 0]} isAnimationActive={false}>
          {data.map((_, i) => (
            <Cell key={i} fill={chartColors[i % chartColors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ===== Share por categoria (donut) — rótulos em % =====
const RADIAN = Math.PI / 180;

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-md border border-graphite bg-obsidian/95 px-3 py-2 shadow-tremor-dropdown">
      <div className="flex items-center gap-2 text-xs">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.payload.fill }} />
        <span className="text-ash">{p.name}</span>
        <span className="value ml-auto font-semibold text-bone">{(p.percent * 100).toFixed(1)}%</span>
      </div>
      <div className="value mt-0.5 text-right text-[0.7rem] text-ash">{brl(p.value)}</div>
    </div>
  );
}

// Tracinho curto saindo da fatia — não encosta no número.
function PercentLabelLine({ cx, cy, midAngle, outerRadius }: any) {
  const r1 = outerRadius + 2;
  const r2 = outerRadius + 8;
  return (
    <line
      x1={cx + r1 * Math.cos(-midAngle * RADIAN)}
      y1={cy + r1 * Math.sin(-midAngle * RADIAN)}
      x2={cx + r2 * Math.cos(-midAngle * RADIAN)}
      y2={cy + r2 * Math.sin(-midAngle * RADIAN)}
      stroke={palette.steel}
      strokeWidth={1}
    />
  );
}

function PercentLabel({ cx, cy, midAngle, outerRadius, percent, fill, payload }: any) {
  const r = outerRadius + 16;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill={payload?.fill ?? fill}
      fontSize={11}
      fontWeight={600}
      fontFamily='"IBM Plex Mono", monospace'
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
}

export function CategoryDonut() {
  const dados = categorias.map((c, i) => ({ ...c, fill: chartColors[i % chartColors.length] }));
  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart margin={{ top: 8, right: 36, bottom: 8, left: 36 }}>
          <Tooltip content={<DonutTooltip />} />
          <Pie
            data={dados}
            dataKey="valor"
            nameKey="nome"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={2}
            stroke={palette.void}
            strokeWidth={2}
            isAnimationActive={false}
            label={PercentLabel}
            labelLine={PercentLabelLine}
          >
            {dados.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Legenda por cor (sempre visível) */}
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {dados.map((d) => (
          <li key={d.nome} className="flex items-center gap-2 text-xs">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.fill }} />
            <span className="truncate text-ash">{d.nome}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ===== Projeção (3 cenários + ajuste por pares opcional) =====
// peerAdjusted: quando true, sobrepõe a linha "Ajustado (pares)" — projeção
// realista refinada pela trajetória mediana de pares bem-sucedidos (RF-008).
export function ProjectionLines({ peerAdjusted = false }: { peerAdjusted?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={projecao} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mes" {...axisStyle} />
        <YAxis tickFormatter={brlCompact} width={64} {...axisStyle} />
        <Tooltip content={<DarkTooltip />} cursor={{ stroke: palette.steel }} />
        <Line type="monotone" name="Otimista" dataKey="otimista" stroke={palette.gain} strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
        <Line type="monotone" name="Realista" dataKey="realista" stroke={palette.ember} strokeWidth={2.5} dot={false} isAnimationActive={false} activeDot={{ r: 4, fill: palette.emberGlow }} />
        <Line type="monotone" name="Pessimista" dataKey="pessimista" stroke={palette.loss} strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
        {peerAdjusted && (
          <Line type="monotone" name="Ajustado (pares)" dataKey="ajustado" stroke={palette.brass} strokeWidth={2} strokeDasharray="6 3" dot={false} isAnimationActive={false} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
