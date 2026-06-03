import { Link, useParams } from 'react-router-dom';
import { getContaDetalhe } from '../data/mock';
import { Panel, DeltaChip } from '../components/ui';
import { TransactionsTable } from '../components/TransactionsTable';
import { SaldoContaArea, CategoriaContaBar } from '../charts';
import { brl } from '../theme/tokens';

function MiniStat({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className="panel p-5">
      <div className="label-stencil text-[0.65rem]">{label}</div>
      <div className={`value mt-2 text-2xl font-semibold ${className || 'text-bone'}`}>{value}</div>
    </div>
  );
}

export function ContaDetalhe() {
  const { id } = useParams();
  const index = Number(id);
  const detalhe = Number.isInteger(index) ? getContaDetalhe(index) : null;

  if (!detalhe) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-ash">Conta não encontrada.</p>
        <Link to="/contas" className="text-sm text-ember hover:underline">
          ← Voltar para contas
        </Link>
      </div>
    );
  }

  const { conta, historico, transacoes, porCategoria, entradas, saidas } = detalhe;
  const negativo = conta.saldo < 0;
  const positiveIsGood = conta.tipo !== 'Cartão de crédito';

  return (
    <div className="space-y-4 p-6">
      {/* Cabeçalho da conta */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/contas" className="text-xs text-ash hover:text-bone">
            ← Contas
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-bone">{conta.instituicao}</h2>
            <span className="rounded border border-graphite bg-obsidian px-2 py-0.5 text-[0.65rem] text-ash">
              {conta.tipo}
            </span>
          </div>
          <div className="text-sm text-ash">{conta.apelido}</div>
        </div>
      </div>

      {/* Overview — números-chave da conta */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Saldo atual" value={brl(conta.saldo)} className={negativo ? 'text-loss' : 'text-bone'} />
        <div className="panel p-5">
          <div className="label-stencil text-[0.65rem]">Variação no mês</div>
          <div className="mt-2">
            <DeltaChip value={conta.delta} positiveIsGood={positiveIsGood} />
          </div>
        </div>
        <MiniStat label="Entradas (mês)" value={brl(entradas)} className="text-gain" />
        <MiniStat label="Saídas (mês)" value={brl(Math.abs(saidas))} className="text-loss" />
      </section>

      {/* Gráficos básicos da conta */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Evolução do saldo" note="últimos 7 meses">
          <SaldoContaArea data={historico} />
        </Panel>
        <Panel title="Gastos por categoria" note="no mês">
          <CategoriaContaBar data={porCategoria} />
        </Panel>
      </section>

      {/* Lista de transações da conta */}
      <Panel title="Transações da conta" note={`${transacoes.length} no período`}>
        <TransactionsTable data={transacoes} />
      </Panel>
    </div>
  );
}
