// Gráficos do detalhamento de uma conta (recebem os dados por props).
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { axisStyle, brlCompact, chartColors, gridStroke, palette } from '../theme/tokens';
import { DarkTooltip } from './shared';

// ===== Evolução do saldo da conta (área) =====
export function SaldoContaArea({ data }: { data: { mes: string; saldo: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="fillSaldoConta" x1="0" y1="0" x2="0" y2="1">
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
          fill="url(#fillSaldoConta)"
          isAnimationActive={false}
          activeDot={{ r: 4, fill: palette.emberGlow, stroke: palette.void }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ===== Gastos por categoria da conta (barra horizontal) =====
export function CategoriaContaBar({ data }: { data: { nome: string; valor: number }[] }) {
  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-ash">Sem despesas no período.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
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
