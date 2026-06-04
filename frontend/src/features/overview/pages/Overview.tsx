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

export function Overview() {
  return (
    <div className="space-y-4 p-6">
      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <StatCard key={k.label} kpi={k} />
        ))}
      </section>

      {/* Painéis */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Saldo consolidado" note="11 meses" className="lg:col-span-2">
          <BalanceArea />
        </Panel>

        <Panel title="Distribuição por categoria" note="maio">
          <CategoryDonut />
        </Panel>

        <Panel title="Gasto por categoria" note="maio">
          <CategoryBar />
        </Panel>

        <Panel title="Entrada × saída" note="6 meses">
          <CashflowBars />
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
          <TransactionsTable />
        </Panel>
      </section>
    </div>
  );
}
