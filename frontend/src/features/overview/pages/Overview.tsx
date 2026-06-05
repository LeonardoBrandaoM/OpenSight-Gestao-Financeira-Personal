import { kpis } from '@/data/mock';
import { Panel, StatCard } from '@/shared/ui';
import {
  BalanceArea,
  CashflowBars,
  CategoryBar,
  CategoryDonut,
  ComparativoComposed,
  EvolucaoArea,
  ProjectionLines,
  ReceitasDespesasDonut,
  WaterfallChart,
} from '@/shared/charts';
import { BudgetList } from '@/features/orcamento/components/BudgetList';
import { TransactionsTable } from '@/features/transacoes/components/TransactionsTable';
import { useContas } from '@/features/contas/useContas';
import { useTransacoes } from '@/features/transacoes/useTransacoes';
import { useAnalytics } from '../useAnalytics';

export function Overview() {
  // Dados ao vivo: patrimônio (contas), últimas transações e agregações do
  // analytics-service (saldo, cashflow, por categoria, resumo). Sem backend, os
  // gráficos caem no default (mock).
  const { contas } = useContas();
  const { transacoes } = useTransacoes();
  const { data: analytics } = useAnalytics();

  const patrimonio = contas.reduce((s, c) => s + c.saldo, 0);
  const resumo = analytics?.resumo;
  const liveKpis = kpis.map((k) => {
    if (k.tipo === 'patrimonio' && patrimonio > 0) return { ...k, valor: patrimonio };
    if (resumo && k.tipo === 'receita') return { ...k, valor: resumo.receitasMes };
    if (resumo && k.tipo === 'despesa') return { ...k, valor: resumo.despesasMes };
    if (resumo && k.tipo === 'economia') return { ...k, valor: resumo.economiaMes };
    return k;
  });
  const recentes = transacoes.slice(0, 12);

  return (
    <div className="space-y-4 p-6">
      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {liveKpis.map((k) => (
          <StatCard key={k.label} kpi={k} />
        ))}
      </section>

      {/* Painéis */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Saldo consolidado" note="11 meses" className="lg:col-span-2">
          <BalanceArea data={analytics?.balanceSeries} />
        </Panel>

        <Panel title="Distribuição por categoria" note="maio">
          <CategoryDonut data={analytics?.byCategory} />
        </Panel>

        <Panel title="Gasto por categoria" note="maio">
          <CategoryBar data={analytics?.byCategory} />
        </Panel>

        <Panel title="Entrada × saída" note="6 meses">
          <CashflowBars data={analytics?.cashflow} />
        </Panel>

        <Panel title="Orçamento do mês" note="4 metas">
          <BudgetList />
        </Panel>

        <Panel title="Projeção de patrimônio" note="cenários · 6 meses" className="lg:col-span-2">
          <ProjectionLines />
        </Panel>

        <Panel title="Receitas vs despesas" note="período">
          <ReceitasDespesasDonut />
        </Panel>

        <Panel title="Evolução de receitas × despesas" note="13 meses" className="lg:col-span-2">
          <EvolucaoArea />
        </Panel>

        <Panel title="Comparativo mensal — receitas, despesas e saldo" note="barras + saldo" className="lg:col-span-3">
          <ComparativoComposed />
        </Panel>

        <Panel title="Composição do saldo" note="waterfall" className="lg:col-span-3">
          <WaterfallChart />
        </Panel>

        <Panel title="Últimas transações" note="somente leitura" className="lg:col-span-3">
          <TransactionsTable data={recentes.length ? recentes : undefined} />
        </Panel>
      </section>
    </div>
  );
}
