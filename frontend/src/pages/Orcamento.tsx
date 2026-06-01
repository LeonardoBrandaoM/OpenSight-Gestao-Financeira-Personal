import { budgets, comprometimento } from '../data/mock';
import { Panel } from '../components/ui';
import { BudgetList } from '../components/BudgetList';
import { GaugeComprometimento } from '../components/chartsExtra';
import { brl } from '../theme/tokens';

function MiniStat({ label, value, tone = 'bone' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="panel p-5">
      <div className="label-stencil text-[0.65rem]">{label}</div>
      <div className={`value mt-2 text-2xl font-semibold text-${tone}`}>{value}</div>
    </div>
  );
}

export function Orcamento() {
  const totalGasto = budgets.reduce((s, b) => s + b.gasto, 0);
  const totalMeta = budgets.reduce((s, b) => s + b.meta, 0);
  const restante = totalMeta - totalGasto;

  return (
    <div className="space-y-4 p-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MiniStat label="Gasto no mês" value={brl(totalGasto)} />
        <MiniStat label="Meta total" value={brl(totalMeta)} />
        <MiniStat label="Restante" value={brl(restante)} tone={restante < 0 ? 'loss' : 'gain'} />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="% Comprometimento de receita" note="gauge">
          <GaugeComprometimento />
        </Panel>
        <Panel title="Análise de comprometimento" note={comprometimento.status}>
          <div className="flex h-full flex-col justify-center gap-2">
            <div className="font-display text-3xl font-bold text-gain">{comprometimento.status}</div>
            <p className="text-sm text-ash">
              <span className="value text-bone">{brl(comprometimento.comprometido)}</span> comprometido de{' '}
              <span className="value text-bone">{brl(comprometimento.receitas)}</span> em receitas
            </p>
            <p className="text-sm text-ash">
              Saldo líquido: <span className="value text-gain">{brl(comprometimento.saldoLiquido)}</span>
            </p>
          </div>
        </Panel>
      </section>

      <Panel title="Metas do mês" note="alertas em 50% / 80% / 100%">
        <BudgetList />
      </Panel>

      <p className="text-xs text-ash">
        Sugestão automática de meta: média dos últimos 3 meses − 10%. Alertas progressivos disparam ao
        atingir 50%, 80% e 100% do limite de cada categoria.
      </p>
    </div>
  );
}
