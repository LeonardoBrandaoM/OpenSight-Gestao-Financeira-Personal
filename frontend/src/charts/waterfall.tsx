// Composição do saldo (waterfall via barras empilhadas com base transparente).
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts';
import { axisStyle, brl, brlCompact, gridStroke, palette } from '../theme/tokens';
import { waterfall } from '../data/mock';
import { ResponsiveWrap } from './shared';

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
