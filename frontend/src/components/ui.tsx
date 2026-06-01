import type { ReactNode } from 'react';
import { Card } from '@tremor/react';
import type { Kpi } from '../data/mock';
import { brl, pct } from '../theme/tokens';

// Painel de superfície blindada com cabeçalho em label estêncil.
export function Panel({
  title,
  note,
  className = '',
  children,
}: {
  title: string;
  note?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={`!rounded-md !border-graphite !bg-gunmetal/70 !ring-0 !shadow-tremor-card ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="label-stencil text-[0.7rem]">{title}</h3>
        {note && <div className="text-xs text-ash">{note}</div>}
      </div>
      {children}
    </Card>
  );
}

// Chip de variação com semântica financeira correta:
// para despesas, subir é ruim (positiveIsGood=false).
export function DeltaChip({
  value,
  positiveIsGood = true,
}: {
  value: number;
  positiveIsGood?: boolean;
}) {
  const up = value >= 0;
  const good = up === positiveIsGood;
  return (
    <span className={`value inline-flex items-center gap-1 text-xs ${good ? 'text-gain' : 'text-loss'}`}>
      <span aria-hidden>{up ? '▲' : '▼'}</span>
      {pct(value)}
    </span>
  );
}

// Cartão de KPI (número mono tabular + variação).
export function StatCard({ kpi }: { kpi: Kpi }) {
  const positiveIsGood = kpi.tipo !== 'despesa';
  return (
    <Card className="!rounded-md !border-l-2 !border-l-crimson !border-graphite !bg-gunmetal/70 !ring-0 !shadow-tremor-card">
      <div className="label-stencil text-[0.65rem]">{kpi.label}</div>
      <div className="value mt-2 text-2xl font-semibold text-bone">{brl(kpi.valor)}</div>
      <div className="mt-1 flex items-center gap-2">
        <DeltaChip value={kpi.delta} positiveIsGood={positiveIsGood} />
        <span className="text-xs text-ash">vs mês anterior</span>
      </div>
    </Card>
  );
}
