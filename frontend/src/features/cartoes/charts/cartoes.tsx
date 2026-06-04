// Gráficos de cartão de crédito (props-driven): histórico de faturas (barras)
// e gastos da fatura por categoria (rosca + legenda).
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { axisStyle, brl, brlCompact, chartColors, gridStroke, palette } from '@/shared/theme/tokens';
import { DarkTooltip, ResponsiveWrap } from '@/shared/charts/shared';

// ===== Histórico de faturas (barras) =====
export function FaturaHistoricoBar({ data }: { data: { mes: string; valor: number }[] }) {
  return (
    <ResponsiveWrap height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mes" {...axisStyle} />
        <YAxis tickFormatter={brlCompact} width={64} {...axisStyle} />
        <Tooltip content={<DarkTooltip />} cursor={{ fill: '#ffffff08' }} />
        <Bar name="Fatura" dataKey="valor" fill={palette.ember} radius={[3, 3, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveWrap>
  );
}

// ===== Gastos da fatura por categoria (rosca + legenda) =====
function FaturaCatTooltip({ active, payload }: any) {
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

export function CartaoCategoriaDonut({ data }: { data: { nome: string; valor: number }[] }) {
  const dados = data.map((d, i) => ({ ...d, fill: chartColors[i % chartColors.length] }));
  const total = dados.reduce((s, d) => s + d.valor, 0);
  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Tooltip content={<FaturaCatTooltip />} />
          <Pie
            data={dados}
            dataKey="valor"
            nameKey="nome"
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
          <li key={d.nome} className="flex items-center gap-2 text-xs">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.fill }} />
            <span className="truncate text-ash">{d.nome}</span>
            <span className="value ml-auto text-bone">{((d.valor / total) * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
