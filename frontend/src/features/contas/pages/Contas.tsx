import { useState } from 'react';
import { Link } from 'react-router-dom';
import { type Conta } from '@/data/mock';
import { DeltaChip, Panel } from '@/shared/ui';
import { brl, chartColors } from '@/shared/theme/tokens';
import { useContas } from '../useContas';

type Aba = 'todas' | 'corrente' | 'credito' | 'investimentos';
const ABAS: { id: Aba; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'corrente', label: 'Conta corrente' },
  { id: 'credito', label: 'Cartão de crédito' },
  { id: 'investimentos', label: 'Investimentos' },
];

type ContaIdx = Conta & { idx: number };

function MiniStat({ label, value, tone = 'bone' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="panel p-5">
      <div className="label-stencil text-[0.65rem]">{label}</div>
      <div className={`value mt-2 text-2xl font-semibold text-${tone}`}>{value}</div>
    </div>
  );
}

function utilCor(pct: number): string {
  if (pct >= 90) return 'bg-loss';
  if (pct >= 70) return 'bg-warning';
  return 'bg-gain';
}

// Participação nos ativos (saldos positivos). `ativos` vem do conjunto carregado.
const share = (saldo: number, ativos: number) => (ativos > 0 && saldo > 0 ? (saldo / ativos) * 100 : 0);

// Cartão de conta padrão (corrente/poupança/visão geral) com participação nos ativos.
function AccountCard({ c, ativos }: { c: ContaIdx; ativos: number }) {
  const negativo = c.saldo < 0;
  const pct = share(c.saldo, ativos);
  const cor = chartColors[c.idx % chartColors.length];
  return (
    <Link
      to={`/contas/${c.idx}`}
      className="panel group flex flex-col p-5 transition-colors hover:border-ember/60 focus:border-ember focus:outline-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display font-semibold text-bone">{c.instituicao}</div>
          <div className="text-xs text-ash">{c.apelido}</div>
        </div>
        <span className="rounded border border-graphite bg-obsidian px-2 py-0.5 text-[0.65rem] text-ash">
          {c.tipo}
        </span>
      </div>
      <div className={`value mt-4 text-xl font-semibold ${negativo ? 'text-loss' : 'text-bone'}`}>
        {brl(c.saldo)}
      </div>
      <div className="mt-1">
        <DeltaChip value={c.delta} positiveIsGood={c.tipo !== 'Cartão de crédito'} />
        <span className="ml-2 text-xs text-ash">no mês</span>
      </div>

      <div className="mt-4">
        {negativo ? (
          <span className="value text-xs text-loss">Passivo (dívida) — fora da participação</span>
        ) : (
          <>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-xs text-ash">do total</span>
              <span className="value text-xs font-semibold text-bone">{pct.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-graphite">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cor }} />
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center text-xs text-ash transition-colors group-hover:text-ember">
        Detalhamento
        <span aria-hidden className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}

// Cartão de crédito: limite, fatura, utilização e datas. Leva à página dedicada.
function CreditCard({ c }: { c: ContaIdx }) {
  const limite = c.limiteTotal ?? 0;
  const fatura = c.faturaAtual ?? Math.abs(c.saldo);
  const disponivel = Math.max(limite - fatura, 0);
  const util = limite > 0 ? (fatura / limite) * 100 : 0;
  return (
    <Link
      to="/cartoes"
      className="panel group flex flex-col p-5 transition-colors hover:border-ember/60 focus:border-ember focus:outline-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display font-semibold text-bone">{c.instituicao}</div>
          <div className="text-xs text-ash">{c.apelido}</div>
        </div>
        <span className="rounded border border-graphite bg-obsidian px-2 py-0.5 text-[0.65rem] text-ash">
          {c.tipo}
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="label-stencil text-[0.6rem]">Fatura atual</span>
        <span className="value text-xl font-semibold text-loss">{brl(fatura)}</span>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-xs text-ash">utilização do limite</span>
          <span className="value text-xs font-semibold text-bone">{util.toFixed(0)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-graphite">
          <div className={`h-full rounded-full ${utilCor(util)}`} style={{ width: `${Math.min(util, 100)}%` }} />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-y-2 text-xs">
        <dt className="text-ash">Limite disponível</dt>
        <dd className="value text-right text-gain">{brl(disponivel)}</dd>
        <dt className="text-ash">Limite total</dt>
        <dd className="value text-right text-bone">{brl(limite)}</dd>
        <dt className="text-ash">Fechamento</dt>
        <dd className="value text-right text-bone">{c.fechamento ?? '—'}</dd>
        <dt className="text-ash">Vencimento</dt>
        <dd className="value text-right text-bone">{c.vencimento ?? '—'}</dd>
      </dl>

      <div className="mt-4 flex items-center text-xs text-ash transition-colors group-hover:text-ember">
        Detalhamento
        <span aria-hidden className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}

// Investimentos: valor, rendimento no mês e composição da carteira por classe.
// Leva à página dedicada.
function InvestCard({ c }: { c: ContaIdx }) {
  const aloc = c.alocacao ?? [];
  return (
    <Link
      to="/investimentos"
      className="panel group flex flex-col p-5 transition-colors hover:border-ember/60 focus:border-ember focus:outline-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display font-semibold text-bone">{c.instituicao}</div>
          <div className="text-xs text-ash">{c.apelido}</div>
        </div>
        <span className="rounded border border-graphite bg-obsidian px-2 py-0.5 text-[0.65rem] text-ash">
          {c.tipo}
        </span>
      </div>

      <div className="value mt-4 text-xl font-semibold text-bone">{brl(c.saldo)}</div>
      <div className="mt-1">
        <DeltaChip value={c.delta} positiveIsGood />
        <span className="ml-2 text-xs text-ash">no mês</span>
      </div>

      {aloc.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="label-stencil text-[0.6rem]">Composição da carteira</div>
          {aloc.map((a, i) => {
            const pct = c.saldo > 0 ? (a.valor / c.saldo) * 100 : 0;
            const cor = chartColors[i % chartColors.length];
            return (
              <div key={a.classe}>
                <div className="mb-0.5 flex items-baseline justify-between text-xs">
                  <span className="flex items-center gap-2 text-bone">
                    <span className="inline-block h-2 w-2 shrink-0 rounded-sm" style={{ background: cor }} />
                    {a.classe}
                  </span>
                  <span className="value text-ash">
                    <span className="text-bone">{pct.toFixed(0)}%</span>
                    <span className="hidden sm:inline"> · {brl(a.valor)}</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-graphite">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cor }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex items-center text-xs text-ash transition-colors group-hover:text-ember">
        Detalhamento
        <span aria-hidden className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}

// Painel comparativo de alocação dos ativos por conta.
function AllocationPanel({ comIndice, ativos }: { comIndice: ContaIdx[]; ativos: number }) {
  const alocacao = comIndice.filter((c) => c.saldo > 0).sort((a, b) => b.saldo - a.saldo);
  return (
    <Panel title="Alocação por conta" note={`ativos ${brl(ativos)}`}>
      <div className="space-y-3">
        {alocacao.map((c) => {
          const pct = share(c.saldo, ativos);
          const cor = chartColors[c.idx % chartColors.length];
          return (
            <div key={c.idx}>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 text-sm text-bone">
                  <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: cor }} />
                  {c.instituicao}
                  <span className="hidden text-xs text-ash sm:inline">{c.apelido}</span>
                </span>
                <span className="value shrink-0 text-xs text-ash">
                  <span className="text-bone">{pct.toFixed(1)}%</span>
                  <span className="hidden sm:inline"> · {brl(c.saldo)}</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-graphite">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cor }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-ash">
        Base de cálculo: soma dos saldos positivos. Dívidas de cartão de crédito não entram na participação.
      </p>
    </Panel>
  );
}

export function Contas() {
  const [aba, setAba] = useState<Aba>('todas');
  const { contas, loading, error, fromMock } = useContas();

  // Derivações a partir dos dados carregados (API ou fallback).
  const comIndice: ContaIdx[] = contas.map((c, i) => ({ ...c, idx: i }));
  const ativos = contas.reduce((s, c) => s + (c.saldo > 0 ? c.saldo : 0), 0);
  const total = contas.reduce((s, c) => s + c.saldo, 0);
  const instituicoes = new Set(contas.map((c) => c.instituicao)).size;
  const corrente = comIndice.filter((c) => c.tipo === 'Conta corrente' || c.tipo === 'Poupança');
  const credito = comIndice.filter((c) => c.tipo === 'Cartão de crédito');
  const investimentos = comIndice.filter((c) => c.tipo === 'Investimentos');

  // Estatísticas do topo adaptadas à aba.
  const stats = (() => {
    if (aba === 'corrente') {
      const soma = corrente.reduce((s, c) => s + c.saldo, 0);
      return [
        { label: 'Total em conta corrente', value: brl(soma) },
        { label: 'Contas', value: String(corrente.length) },
        { label: '% dos ativos', value: `${share(soma, ativos).toFixed(1)}%` },
      ];
    }
    if (aba === 'credito') {
      const fatura = credito.reduce((s, c) => s + (c.faturaAtual ?? Math.abs(c.saldo)), 0);
      const limite = credito.reduce((s, c) => s + (c.limiteTotal ?? 0), 0);
      const util = limite > 0 ? (fatura / limite) * 100 : 0;
      return [
        { label: 'Fatura atual', value: brl(fatura), tone: 'loss' },
        { label: 'Limite disponível', value: brl(Math.max(limite - fatura, 0)), tone: 'gain' },
        { label: 'Utilização', value: `${util.toFixed(0)}%` },
      ];
    }
    if (aba === 'investimentos') {
      const soma = investimentos.reduce((s, c) => s + c.saldo, 0);
      const rend = investimentos.length
        ? investimentos.reduce((s, c) => s + c.delta, 0) / investimentos.length
        : 0;
      return [
        { label: 'Total investido', value: brl(soma) },
        { label: 'Rendimento médio (mês)', value: `${rend > 0 ? '+' : ''}${rend.toFixed(1)}%`, tone: 'gain' },
        { label: 'Carteiras', value: String(investimentos.length) },
      ];
    }
    return [
      { label: 'Patrimônio total', value: brl(total) },
      { label: 'Contas conectadas', value: String(contas.length) },
      { label: 'Instituições', value: String(instituicoes) },
    ];
  })();

  if (loading) {
    return (
      <div className="p-6">
        <div className="panel p-8 text-center text-sm text-ash">Carregando contas…</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {fromMock && (
        <div className="panel border-l-4 border-l-warning p-3 text-xs text-ash">
          <span className="label-stencil text-[0.6rem] !text-warning">Backend indisponível</span>{' '}
          exibindo dados de exemplo (a API <span className="value">/api/v1/accounts</span> não respondeu
          {error ? `: ${error}` : ''}).
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <MiniStat key={s.label} label={s.label} value={s.value} tone={(s as { tone?: string }).tone} />
        ))}
      </section>

      {/* Abas por tipo de conta */}
      <div className="flex flex-wrap gap-1 rounded-md border border-graphite bg-obsidian/60 p-1" role="tablist">
        {ABAS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={aba === t.id}
            onClick={() => setAba(t.id)}
            className={`rounded px-3 py-1.5 text-xs transition ${
              aba === t.id ? 'bg-crimson/20 font-semibold text-bone' : 'text-ash hover:text-bone'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {aba === 'todas' && (
        <>
          <AllocationPanel comIndice={comIndice} ativos={ativos} />
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {comIndice.map((c) =>
              c.tipo === 'Cartão de crédito' ? (
                <CreditCard key={c.idx} c={c} />
              ) : c.tipo === 'Investimentos' ? (
                <InvestCard key={c.idx} c={c} />
              ) : (
                <AccountCard key={c.idx} c={c} ativos={ativos} />
              ),
            )}
          </section>
        </>
      )}

      {aba === 'corrente' && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {corrente.map((c) => (
            <AccountCard key={c.idx} c={c} ativos={ativos} />
          ))}
        </section>
      )}

      {aba === 'credito' && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {credito.map((c) => (
            <CreditCard key={c.idx} c={c} />
          ))}
        </section>
      )}

      {aba === 'investimentos' && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {investimentos.map((c) => (
            <InvestCard key={c.idx} c={c} />
          ))}
        </section>
      )}
    </div>
  );
}
