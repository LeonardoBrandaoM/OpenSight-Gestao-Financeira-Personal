import { useMemo, useState } from 'react';
import { transacoes } from '@/data/mock';
import { Panel } from '@/shared/ui';
import { TransactionsTable } from '@/features/transacoes/components/TransactionsTable';
import { FluxoSankey, HorarioPicoHeatmap, MetodoPagamentoDonut } from '@/shared/charts';
import { brl } from '@/shared/theme/tokens';

export function Transacoes() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todas');

  const categorias = useMemo(
    () => ['Todas', ...Array.from(new Set(transacoes.map((t) => t.categoria)))],
    [],
  );

  const filtradas = useMemo(
    () =>
      transacoes.filter(
        (t) =>
          (cat === 'Todas' || t.categoria === cat) &&
          t.descricao.toLowerCase().includes(q.toLowerCase().trim()),
      ),
    [q, cat],
  );

  const entradas = filtradas.filter((t) => t.valor > 0).reduce((s, t) => s + t.valor, 0);
  const saidas = filtradas.filter((t) => t.valor < 0).reduce((s, t) => s + t.valor, 0);

  return (
    <div className="space-y-4 p-6">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Horário de pico das transações" note="dia × hora">
          <HorarioPicoHeatmap />
        </Panel>
        <Panel title="Distribuição por método de pagamento" note="rosca">
          <MetodoPagamentoDonut />
        </Panel>
      </section>

      <Panel title="Fluxo financeiro: tipo → categoria → estabelecimento" note="sankey">
        <FluxoSankey />
      </Panel>

      {/* Transações em si — sempre por último, na parte mais baixa da tela. */}
      <Panel
        title="Transações"
        note={
          <span>
            <span className="value text-gain">{brl(entradas)}</span> entradas ·{' '}
            <span className="value text-loss">{brl(Math.abs(saidas))}</span> saídas
          </span>
        }
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar descrição…"
            className="flex-1 rounded-md border border-graphite bg-obsidian px-3 py-2 text-sm text-bone placeholder:text-steel focus:border-ember focus:outline-none focus:ring-1 focus:ring-ember"
          />
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="rounded-md border border-graphite bg-obsidian px-3 py-2 text-sm text-bone focus:border-ember focus:outline-none focus:ring-1 focus:ring-ember"
          >
            {categorias.map((c) => (
              <option key={c} value={c} className="bg-obsidian">
                {c}
              </option>
            ))}
          </select>
        </div>

        <TransactionsTable data={filtradas} />
      </Panel>
    </div>
  );
}
