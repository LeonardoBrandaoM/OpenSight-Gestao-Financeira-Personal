// Séries temporais: evolução receitas × despesas (área), comparativo mensal
// (barras + linha do saldo) e média mensal por categoria (multi-linha).
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { axisStyle, brlCompact, chartColors, gridStroke, niceAxis, palette } from '@/shared/theme/tokens';
import { evolucaoMensal, mediaMensalCategorias, seriesMediaMensal } from '@/data/mock';
import { MiniTooltip, ResponsiveWrap, fmtMes } from './shared';

// ===== Evolução temporal Receitas × Despesas (área) =====
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

// ===== Comparativo mensal — barras + linha do saldo (eixo único, marcas dinâmicas) =====
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

// ===== Evolução da média mensal por categoria (multi-linha) =====
export function MediaMensalLinhas({
  series = seriesMediaMensal,
  data = mediaMensalCategorias,
}: {
  series?: string[];
  data?: typeof mediaMensalCategorias;
}) {
  return (
    <ResponsiveWrap height={300}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mes" tickFormatter={fmtMes} {...axisStyle} />
        <YAxis tickFormatter={brlCompact} width={56} {...axisStyle} />
        <Tooltip content={<MiniTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {series.map((s, i) => (
          <Line key={s} type="monotone" name={s} dataKey={s} stroke={chartColors[i % chartColors.length]} strokeWidth={2} dot={false} isAnimationActive={false} />
        ))}
      </LineChart>
    </ResponsiveWrap>
  );
}
