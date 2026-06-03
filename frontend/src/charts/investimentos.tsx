// Gráficos de investimentos (props-driven): composição da carteira (rosca),
// evolução do valor (área) e rentabilidade por classe (barra divergente).
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { axisStyle, brl, brlCompact, chartColors, gridStroke, palette } from '../theme/tokens';
import { DarkTooltip, ResponsiveWrap } from './shared';

// ===== Composição da carteira por classe (rosca + legenda) =====
function CarteiraTooltip({ active, payload }: any) {
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

export function CarteiraDonut({ data }: { data: { classe: string; valor: number }[] }) {
  const dados = data.map((d, i) => ({ ...d, fill: chartColors[i % chartColors.length] }));
  const total = dados.reduce((s, d) => s + d.valor, 0);
  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Tooltip content={<CarteiraTooltip />} />
          <Pie
            data={dados}
            dataKey="valor"
            nameKey="classe"
            innerRadius={56}
            outerRadius={84}
            paddingAngle={2}
            stroke={palette.void}
            strokeWidth={2}
            isAnimationActive={false}
          >
            {dados.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {dados.map((d) => (
          <li key={d.classe} className="flex items-center gap-2 text-xs">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.fill }} />
            <span className="truncate text-ash">{d.classe}</span>
            <span className="value ml-auto text-bone">{((d.valor / total) * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ===== Evolução do valor da carteira (área) =====
export function CarteiraEvolucaoArea({ data }: { data: { mes: string; valor: number }[] }) {
  return (
    <ResponsiveWrap height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="fillCarteira" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.gain} stopOpacity={0.35} />
            <stop offset="100%" stopColor={palette.gain} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mes" {...axisStyle} />
        <YAxis tickFormatter={brlCompact} width={64} {...axisStyle} />
        <Tooltip content={<DarkTooltip />} cursor={{ stroke: palette.steel }} />
        <Area
          type="monotone"
          name="Carteira"
          dataKey="valor"
          stroke={palette.gain}
          strokeWidth={2}
          fill="url(#fillCarteira)"
          isAnimationActive={false}
          activeDot={{ r: 4, fill: palette.gain, stroke: palette.void }}
        />
      </AreaChart>
    </ResponsiveWrap>
  );
}

// ===== Rentabilidade por classe no mês (barra; cor por sinal) =====
function PctTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value as number;
  return (
    <div className="rounded-md border border-graphite bg-obsidian/95 px-3 py-2 shadow-tremor-dropdown">
      <div className="label-stencil mb-1 text-[0.6rem]">{label}</div>
      <div className={`value text-sm ${v >= 0 ? 'text-gain' : 'text-loss'}`}>
        {v > 0 ? '+' : ''}
        {v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
      </div>
    </div>
  );
}

export function RentabilidadeClasseBar({ data }: { data: { classe: string; rendimento: number }[] }) {
  return (
    <ResponsiveWrap height={240}>
      <BarChart layout="vertical" data={data} margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => `${v}%`} {...axisStyle} />
        <YAxis type="category" dataKey="classe" width={92} {...axisStyle} />
        <Tooltip content={<PctTooltip />} cursor={{ fill: '#ffffff08' }} />
        <ReferenceLine x={0} stroke={palette.steel} />
        <Bar name="Rentabilidade" dataKey="rendimento" radius={[0, 3, 3, 0]} isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.rendimento >= 0 ? palette.gain : palette.loss} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveWrap>
  );
}
