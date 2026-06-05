import { useEffect, useMemo, useState } from 'react';
import { sugerirMeta, categoriasCadastro } from '@/data/mock';
import { Panel, DeltaChip } from '@/shared/ui';
import { GaugeComprometimento } from '@/shared/charts';
import { brl } from '@/shared/theme/tokens';
import { useBudget } from '../useBudget';
import type { SugestaoOrcamento } from '../data';

type Modo = 'manual' | 'auto';

// Horizontes de meta (RF-009): fator converte a meta mensal base para o período.
type Horizonte = 'semanal' | 'mensal' | 'trimestral' | 'anual';
const HORIZONTES: { id: Horizonte; label: string; fator: number }[] = [
  { id: 'semanal', label: 'Semanal', fator: 0.25 },
  { id: 'mensal', label: 'Mensal', fator: 1 },
  { id: 'trimestral', label: 'Trimestral', fator: 3 },
  { id: 'anual', label: 'Anual', fator: 12 },
];

function HorizonteSelector({ horizonte, setHorizonte }: { horizonte: Horizonte; setHorizonte: (h: Horizonte) => void }) {
  return (
    <div className="inline-flex rounded-md border border-graphite bg-obsidian/60 p-0.5">
      {HORIZONTES.map((h) => (
        <button
          key={h.id}
          type="button"
          onClick={() => setHorizonte(h.id)}
          className={`rounded px-2.5 py-1 text-xs transition ${
            horizonte === h.id ? 'bg-crimson/20 font-semibold text-bone' : 'text-ash hover:text-bone'
          }`}
        >
          {h.label}
        </button>
      ))}
    </div>
  );
}

function MiniStat({ label, value, tone = 'bone' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="panel p-5">
      <div className="label-stencil text-[0.65rem]">{label}</div>
      <div className={`value mt-2 text-2xl font-semibold text-${tone}`}>{value}</div>
    </div>
  );
}

function ModeToggle({ modo, setModo }: { modo: Modo; setModo: (m: Modo) => void }) {
  const opts: { id: Modo; label: string; sub: string }[] = [
    { id: 'manual', label: 'Orçamento manual', sub: 'Defina as metas por categoria' },
    { id: 'auto', label: 'Sugestões automáticas', sub: 'Baseado nos últimos 3 meses' },
  ];
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="tablist" aria-label="Modo de orçamento">
      {opts.map((o) => {
        const ativo = modo === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={ativo}
            onClick={() => setModo(o.id)}
            className={`panel flex flex-col items-start gap-0.5 p-4 text-left transition ${
              ativo ? '!border-crimson ring-1 ring-crimson/40' : 'hover:!border-ash/40'
            }`}
          >
            <span className={`text-sm font-semibold ${ativo ? 'text-bone' : 'text-ash'}`}>{o.label}</span>
            <span className="text-xs text-ash">{o.sub}</span>
          </button>
        );
      })}
    </div>
  );
}

function corPct(pct: number): string {
  if (pct > 100) return 'text-loss';
  if (pct >= 80) return 'text-warning';
  return 'text-gain';
}
function corBarra(pct: number): string {
  if (pct > 100) return 'bg-loss';
  if (pct >= 80) return 'bg-warning';
  return 'bg-gain';
}

function AddMeta({ disponiveis, onAdd }: { disponiveis: string[]; onAdd: (cat: string) => void }) {
  const [sel, setSel] = useState('');
  if (disponiveis.length === 0) {
    return <p className="text-xs text-ash">Todas as categorias de despesa já têm meta.</p>;
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={sel}
        onChange={(e) => setSel(e.target.value)}
        className="rounded border border-graphite bg-graphite/30 px-2 py-1.5 text-sm text-bone outline-none focus:border-brass"
      >
        <option value="">Adicionar meta para…</option>
        {disponiveis.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <button
        type="button"
        disabled={!sel}
        onClick={() => {
          if (!sel) return;
          onAdd(sel);
          setSel('');
        }}
        className="rounded border border-crimson bg-crimson/15 px-3 py-1.5 text-xs font-semibold text-bone transition hover:bg-crimson/25 disabled:cursor-not-allowed disabled:opacity-40"
      >
        + Adicionar
      </button>
    </div>
  );
}

// Editor manual: ajusta a meta de cada categoria com feedback de progresso.
function ManualEditor({
  metas,
  setMeta,
  removeMeta,
  addMeta,
  disponiveis,
  fator,
  gastoPorCategoria,
}: {
  metas: Record<string, number>;
  setMeta: (cat: string, valor: number) => void;
  removeMeta: (cat: string) => void;
  addMeta: (cat: string) => void;
  disponiveis: string[];
  fator: number;
  gastoPorCategoria: Record<string, number>;
}) {
  const cats = Object.keys(metas);
  return (
    <div className="space-y-5">
      {cats.length === 0 ? (
        <p className="py-6 text-center text-sm text-ash">
          Nenhuma meta definida. Adicione abaixo ou use as <span className="text-bone">Sugestões automáticas</span>.
        </p>
      ) : (
        cats.map((cat) => {
          const metaBase = metas[cat];
          const meta = metaBase * fator;
          const gasto = (gastoPorCategoria[cat] ?? 0) * fator;
          const pct = metaBase > 0 ? Math.round(((gastoPorCategoria[cat] ?? 0) / metaBase) * 100) : 0;
          return (
            <div key={cat}>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-bone">{cat}</span>
                <div className="flex items-center gap-2">
                  <span className="value text-xs text-ash">{brl(gasto)} gasto</span>
                  <div className="flex items-center gap-1 rounded border border-graphite bg-graphite/30 px-2 py-1">
                    <span className="text-xs text-ash">R$</span>
                    <input
                      type="number"
                      min={0}
                      step={10}
                      value={Math.round(meta)}
                      onChange={(e) => setMeta(cat, Math.max(0, Number(e.target.value)) / fator)}
                      className="value w-24 bg-transparent text-right text-sm text-bone outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label={`Meta de ${cat}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMeta(cat)}
                    className="text-ash transition hover:text-loss"
                    aria-label={`Remover meta de ${cat}`}
                    title="Remover meta"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-graphite">
                <div className={`h-full rounded-full ${corBarra(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div className="mt-0.5 text-right">
                <span className={`value text-[0.7rem] ${corPct(pct)}`}>{pct}%</span>
              </div>
            </div>
          );
        })
      )}

      <div className="border-t border-graphite pt-4">
        <AddMeta disponiveis={disponiveis} onAdd={addMeta} />
      </div>
    </div>
  );
}

function AutoSuggestions({
  metas,
  sugestoes,
  aplicar,
  aplicarTodas,
}: {
  metas: Record<string, number>;
  sugestoes: SugestaoOrcamento[];
  aplicar: (cat: string, valor: number) => void;
  aplicarTodas: () => void;
}) {
  const pendentes = sugestoes.filter((s) => metas[s.categoria] !== sugerirMeta(s.media3m)).length;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ash">
          Metas sugeridas = média dos últimos 3 meses <span className="text-bone">− 10%</span>.
        </p>
        <button
          type="button"
          onClick={aplicarTodas}
          disabled={pendentes === 0}
          className="rounded border border-crimson bg-crimson/15 px-3 py-1.5 text-xs font-semibold text-bone transition hover:bg-crimson/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pendentes === 0 ? 'Tudo aplicado' : `Aplicar todas (${pendentes})`}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {sugestoes.map((s) => {
          const sugerido = sugerirMeta(s.media3m);
          const aplicada = metas[s.categoria] === sugerido;
          return (
            <div key={s.categoria} className="panel flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-bone">{s.categoria}</div>
                  <div className="mt-0.5 text-xs text-ash">
                    {s.metaAtual === null ? (
                      <span className="text-warning">sem meta definida</span>
                    ) : (
                      <>meta atual {brl(s.metaAtual)}</>
                    )}
                  </div>
                </div>
                <DeltaChip value={s.tendencia} positiveIsGood={false} />
              </div>

              <div className="flex items-end justify-between gap-2">
                <div>
                  <div className="label-stencil text-[0.6rem]">média 3 meses</div>
                  <div className="value text-sm text-ash">{brl(s.media3m)}</div>
                </div>
                <div className="text-right">
                  <div className="label-stencil text-[0.6rem]">meta sugerida</div>
                  <div className="value text-lg font-semibold text-bone">{brl(sugerido)}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => aplicar(s.categoria, sugerido)}
                disabled={aplicada}
                className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                  aplicada
                    ? 'cursor-default border border-graphite text-gain'
                    : 'border border-crimson bg-crimson/15 text-bone hover:bg-crimson/25'
                }`}
              >
                {aplicada ? '✓ Aplicada' : 'Aplicar sugestão'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Orcamento() {
  const { data: budget } = useBudget();
  const { metas: budgetMetas, sugestoes, gastoPorCategoria, comprometimento } = budget;

  const [modo, setModo] = useState<Modo>('manual');
  const [horizonte, setHorizonte] = useState<Horizonte>('mensal');
  const [metas, setMetas] = useState<Record<string, number>>({});

  // Inicializa/atualiza as metas quando o orçamento carrega do serviço.
  useEffect(() => {
    setMetas(Object.fromEntries(budgetMetas.map((b) => [b.categoria, b.meta])));
  }, [budgetMetas]);

  const fator = HORIZONTES.find((h) => h.id === horizonte)!.fator;

  const setMeta = (cat: string, valor: number) => setMetas((m) => ({ ...m, [cat]: valor }));
  const removeMeta = (cat: string) =>
    setMetas((m) => {
      const next = { ...m };
      delete next[cat];
      return next;
    });
  const addMeta = (cat: string) => {
    const base = gastoPorCategoria[cat] ?? 0;
    setMeta(cat, Math.max(100, Math.round((base || 100) / 10) * 10));
  };
  const aplicarTodas = () =>
    setMetas((m) => {
      const next = { ...m };
      for (const s of sugestoes) next[s.categoria] = sugerirMeta(s.media3m);
      return next;
    });

  // Categorias de despesa (base ou personalizadas) ainda sem meta.
  const disponiveis = categoriasCadastro
    .filter((c) => c.tipo === 'despesa' && !(c.nome in metas))
    .map((c) => c.nome);

  const { totalGasto, totalMeta, restante } = useMemo(() => {
    const cats = Object.keys(metas);
    const gasto = cats.reduce((s, c) => s + (gastoPorCategoria[c] ?? 0), 0);
    const meta = cats.reduce((s, c) => s + metas[c], 0);
    return { totalGasto: gasto, totalMeta: meta, restante: meta - gasto };
  }, [metas, gastoPorCategoria]);

  const periodoLabel = HORIZONTES.find((h) => h.id === horizonte)!.label.toLowerCase();

  return (
    <div className="space-y-4 p-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MiniStat label={`Gasto (${periodoLabel})`} value={brl(totalGasto * fator)} />
        <MiniStat label={`Meta total (${periodoLabel})`} value={brl(totalMeta * fator)} />
        <MiniStat label="Restante" value={brl(restante * fator)} tone={restante < 0 ? 'loss' : 'gain'} />
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

      <ModeToggle modo={modo} setModo={setModo} />

      {modo === 'manual' ? (
        <Panel title="Metas por categoria" note={<HorizonteSelector horizonte={horizonte} setHorizonte={setHorizonte} />}>
          <ManualEditor
            metas={metas}
            setMeta={setMeta}
            removeMeta={removeMeta}
            addMeta={addMeta}
            disponiveis={disponiveis}
            fator={fator}
            gastoPorCategoria={gastoPorCategoria}
          />
        </Panel>
      ) : (
        <Panel title="Sugestões de orçamento" note="média 3 meses − 10%">
          <AutoSuggestions metas={metas} sugestoes={sugestoes} aplicar={setMeta} aplicarTodas={aplicarTodas} />
        </Panel>
      )}

      <p className="text-xs text-ash">
        Metas podem ser criadas para qualquer categoria — base ou personalizada — em horizontes semanal, mensal,
        trimestral ou anual. Alertas progressivos disparam ao atingir 50%, 80% e 100% do limite. As sugestões
        automáticas usam a média dos últimos 3 meses com folga de 10% e podem introduzir categorias ainda sem
        orçamento.
      </p>
    </div>
  );
}
