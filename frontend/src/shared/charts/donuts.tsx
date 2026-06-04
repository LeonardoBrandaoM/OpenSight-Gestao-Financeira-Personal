// Roscas/sunburst: receitas × despesas, método de pagamento e hierarquia de
// gastos (crédito × débito em 2 anéis).
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { chartColors, palette } from '@/shared/theme/tokens';
import { hierarquiaExterna, hierarquiaInterna, metodoPagamento, receitasDespesas } from '@/data/mock';
import { MiniTooltip, ResponsiveWrap } from './shared';

// ===== Receitas vs Despesas (rosca, %) =====
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

// ===== Distribuição por método de pagamento (rosca) =====
// Linha-guia curta (≈20% mais curta que a padrão do Recharts) e rótulo logo após.
const RADIAN_METODO = Math.PI / 180;
function MetodoLabelLine({ cx, cy, midAngle, outerRadius }: any) {
  const c = Math.cos(-midAngle * RADIAN_METODO);
  const s = Math.sin(-midAngle * RADIAN_METODO);
  const r1 = outerRadius + 2;
  const r2 = outerRadius + 18;
  return (
    <line x1={cx + r1 * c} y1={cy + r1 * s} x2={cx + r2 * c} y2={cy + r2 * s} stroke={palette.steel} strokeWidth={1} />
  );
}
function MetodoLabel({ cx, cy, midAngle, outerRadius, name, percent, index }: any) {
  const r = outerRadius + 22;
  const x = cx + r * Math.cos(-midAngle * RADIAN_METODO);
  const y = cy + r * Math.sin(-midAngle * RADIAN_METODO);
  return (
    <text
      x={x}
      y={y}
      fill={chartColors[index % chartColors.length]}
      fontSize={11}
      fontFamily='"IBM Plex Mono", monospace'
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}
export function MetodoPagamentoDonut() {
  return (
    <ResponsiveWrap>
      <PieChart>
        <Tooltip content={<MiniTooltip unidade="pct" />} />
        <Pie data={metodoPagamento} dataKey="valor" nameKey="metodo" innerRadius={56} outerRadius={84} paddingAngle={2} stroke={palette.void} strokeWidth={2} isAnimationActive={false}
          label={MetodoLabel} labelLine={MetodoLabelLine}>
          {metodoPagamento.map((_, i) => (
            <Cell key={i} fill={chartColors[i % chartColors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveWrap>
  );
}

// ===== Hierarquia de gastos (sunburst via 2 anéis) =====
export function HierarquiaSunburst() {
  const coresInternas: Record<string, string> = { 'Crédito': palette.gain, 'Débito': palette.info };
  const interna = hierarquiaInterna.map((d) => ({ ...d, fill: coresInternas[d.nome] }));
  const externa = hierarquiaExterna.map((d, i) => ({ ...d, fill: chartColors[i % chartColors.length] }));
  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Tooltip content={<MiniTooltip unidade="pct" />} />
          <Pie data={interna} dataKey="valor" nameKey="nome" outerRadius={52} stroke={palette.void} strokeWidth={2} isAnimationActive={false}>
            {interna.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Pie>
          <Pie data={externa} dataKey="valor" nameKey="nome" innerRadius={58} outerRadius={88} stroke={palette.void} strokeWidth={2} isAnimationActive={false}>
            {externa.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Legenda — anel interno (crédito × débito) e anel externo (origem) */}
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-b border-graphite/60 pb-2">
        {interna.map((d) => (
          <li key={d.nome} className="flex items-center gap-2 text-xs">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.fill }} />
            <span className="text-ash">{d.nome}</span>
            <span className="value text-bone">{d.valor}%</span>
          </li>
        ))}
      </ul>
      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
        {externa.map((d) => (
          <li key={d.nome} className="flex items-center gap-2 text-xs">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.fill }} />
            <span className="truncate text-ash">{d.nome}</span>
            <span className="value ml-auto text-bone">{d.valor}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
