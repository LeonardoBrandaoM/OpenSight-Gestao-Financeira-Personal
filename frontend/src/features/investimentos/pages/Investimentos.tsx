import { Panel, DeltaChip } from '@/shared/ui';
import { CarteiraDonut, CarteiraEvolucaoArea, RentabilidadeClasseBar } from '@/features/investimentos/charts/investimentos';
import { brl, chartColors } from '@/shared/theme/tokens';
import { useInvestimentos } from '../useInvestimentos';

function MiniStat({ label, value, tone = 'bone' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="panel p-5">
      <div className="label-stencil text-[0.65rem]">{label}</div>
      <div className={`value mt-2 text-2xl font-semibold text-${tone}`}>{value}</div>
    </div>
  );
}

const corClasse: Record<string, string> = {
  'Renda fixa': chartColors[0],
  'Ações': chartColors[1],
  'FIIs': chartColors[2],
  'Cripto': chartColors[3],
};

export function Investimentos() {
  const { data } = useInvestimentos();
  const { resumo: investResumo, alocacao: carteiraAlocacao, evolucao: carteiraEvolucao, rendimentoPorClasse, posicoes } = data;
  const total = posicoes.reduce((s, p) => s + p.valor, 0);

  return (
    <div className="space-y-4 p-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Total investido" value={brl(investResumo.total)} />
        <div className="panel p-5">
          <div className="label-stencil text-[0.65rem]">Rendimento (mês)</div>
          <div className="value mt-2 text-2xl font-semibold text-gain">
            +{investResumo.rendimentoMes.toFixed(1).replace('.', ',')}%
          </div>
        </div>
        <MiniStat label="Rentabilidade 12m" value={`+${investResumo.rentabilidade12m.toFixed(1).replace('.', ',')}%`} tone="gain" />
        <MiniStat label="Aporte do mês" value={brl(investResumo.aporteMes)} />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Composição da carteira" note="por classe">
          <CarteiraDonut data={carteiraAlocacao} />
        </Panel>
        <Panel title="Evolução da carteira" note="8 meses">
          <CarteiraEvolucaoArea data={carteiraEvolucao} />
        </Panel>
      </section>

      <Panel title="Rentabilidade por classe" note="no mês">
        <RentabilidadeClasseBar data={rendimentoPorClasse} />
      </Panel>

      <Panel title="Posições" note={`${posicoes.length} ativos · ${brl(total)}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-graphite">
                <th className="label-stencil pb-2 text-[0.6rem]">Ativo</th>
                <th className="label-stencil pb-2 text-[0.6rem]">Classe</th>
                <th className="label-stencil pb-2 text-right text-[0.6rem]">Valor</th>
                <th className="label-stencil pb-2 text-right text-[0.6rem]">% carteira</th>
                <th className="label-stencil pb-2 text-right text-[0.6rem]">Rend. (mês)</th>
              </tr>
            </thead>
            <tbody>
              {posicoes.map((p) => (
                <tr key={p.ativo} className="border-b border-graphite/50 last:border-0 hover:bg-graphite/30">
                  <td className="py-2.5 pr-4 font-medium text-bone">{p.ativo}</td>
                  <td className="py-2.5 pr-4">
                    <span className="inline-flex items-center gap-2 text-ash">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-sm"
                        style={{ background: corClasse[p.classe] ?? chartColors[4] }}
                      />
                      {p.classe}
                    </span>
                  </td>
                  <td className="value py-2.5 pr-4 text-right text-bone">{brl(p.valor)}</td>
                  <td className="value py-2.5 pr-4 text-right text-ash">{((p.valor / total) * 100).toFixed(1)}%</td>
                  <td className="py-2.5 text-right">
                    <DeltaChip value={p.rendimento} positiveIsGood />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="text-xs text-ash">
        Visão somente leitura da carteira consolidada via Open Finance. Rentabilidades passadas não garantem
        resultados futuros.
      </p>
    </div>
  );
}
