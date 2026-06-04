import { cartaoResumo, faturaHistorico, cartaoPorCategoria, cartaoLancamentos } from '@/data/mock';
import { Panel } from '@/shared/ui';
import { FaturaHistoricoBar, CartaoCategoriaDonut } from '@/features/cartoes/charts/cartoes';
import { brl } from '@/shared/theme/tokens';

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

export function Cartoes() {
  const { limiteTotal, faturaAtual, vencimento, fechamento, melhorDiaCompra } = cartaoResumo;
  const disponivel = Math.max(limiteTotal - faturaAtual, 0);
  const util = limiteTotal > 0 ? (faturaAtual / limiteTotal) * 100 : 0;

  return (
    <div className="space-y-4 p-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Fatura atual" value={brl(faturaAtual)} tone="loss" />
        <MiniStat label="Limite disponível" value={brl(disponivel)} tone="gain" />
        <MiniStat label="Utilização" value={`${util.toFixed(0)}%`} />
        <MiniStat label="Vencimento" value={vencimento} />
      </section>

      <Panel title={`${cartaoResumo.instituicao} ${cartaoResumo.apelido}`} note="Cartão de crédito">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-sm text-ash">Utilização do limite</span>
          <span className="value text-sm font-semibold text-bone">{util.toFixed(0)}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-graphite">
          <div className={`h-full rounded-full ${utilCor(util)}`} style={{ width: `${Math.min(util, 100)}%` }} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="label-stencil text-[0.6rem]">Limite total</dt>
            <dd className="value mt-1 text-bone">{brl(limiteTotal)}</dd>
          </div>
          <div>
            <dt className="label-stencil text-[0.6rem]">Disponível</dt>
            <dd className="value mt-1 text-gain">{brl(disponivel)}</dd>
          </div>
          <div>
            <dt className="label-stencil text-[0.6rem]">Fechamento</dt>
            <dd className="value mt-1 text-bone">{fechamento}</dd>
          </div>
          <div>
            <dt className="label-stencil text-[0.6rem]">Melhor dia de compra</dt>
            <dd className="value mt-1 text-bone">{melhorDiaCompra}</dd>
          </div>
        </dl>
      </Panel>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Histórico de faturas" note="6 meses">
          <FaturaHistoricoBar data={faturaHistorico} />
        </Panel>
        <Panel title="Gastos da fatura por categoria" note="atual">
          <CartaoCategoriaDonut data={cartaoPorCategoria} />
        </Panel>
      </section>

      <Panel title="Lançamentos recentes" note={`${cartaoLancamentos.length} no período`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-graphite">
                <th className="label-stencil pb-2 text-[0.6rem]">Data</th>
                <th className="label-stencil pb-2 text-[0.6rem]">Descrição</th>
                <th className="label-stencil pb-2 text-[0.6rem]">Categoria</th>
                <th className="label-stencil pb-2 text-right text-[0.6rem]">Valor</th>
              </tr>
            </thead>
            <tbody>
              {cartaoLancamentos.map((l, i) => (
                <tr key={i} className="border-b border-graphite/50 last:border-0 hover:bg-graphite/30">
                  <td className="value py-2.5 pr-4 text-ash">{l.data}</td>
                  <td className="py-2.5 pr-4 font-medium text-bone">{l.descricao}</td>
                  <td className="py-2.5 pr-4 text-ash">{l.categoria}</td>
                  <td className="value py-2.5 text-right text-loss">{brl(l.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="text-xs text-ash">
        Visão somente leitura do cartão via Open Finance — nenhuma fatura é paga pelo OpenSight.
      </p>
    </div>
  );
}
