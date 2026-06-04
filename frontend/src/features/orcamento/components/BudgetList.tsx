import { ProgressBar } from '@tremor/react';
import { budgets } from '@/data/mock';
import { brl } from '@/shared/theme/tokens';

// Cores semânticas de orçamento (Tremor color names, ver safelist do tailwind):
// < 80% saudável (emerald) · 80–100% atenção (amber) · > 100% estourado (red)
function corDoProgresso(pct: number): 'emerald' | 'amber' | 'red' {
  if (pct > 100) return 'red';
  if (pct >= 80) return 'amber';
  return 'emerald';
}

export function BudgetList() {
  return (
    <div className="space-y-4">
      {budgets.map((b) => {
        const pct = Math.round((b.gasto / b.meta) * 100);
        return (
          <div key={b.categoria}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-sm text-bone">{b.categoria}</span>
              <span className="value text-xs text-ash">
                <span className="text-bone">{brl(b.gasto)}</span> / {brl(b.meta)}
              </span>
            </div>
            <ProgressBar value={Math.min(pct, 100)} color={corDoProgresso(pct)} className="[&>div]:!bg-graphite" />
            <div className="mt-0.5 text-right">
              <span className={`value text-[0.7rem] ${pct > 100 ? 'text-loss' : pct >= 80 ? 'text-warning' : 'text-gain'}`}>
                {pct}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
