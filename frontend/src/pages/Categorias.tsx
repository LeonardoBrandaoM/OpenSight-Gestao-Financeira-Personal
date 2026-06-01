import { categorias } from '../data/mock';
import { Panel } from '../components/ui';
import { CategoryBar, CategoryDonut } from '../components/charts';
import {
  BolhasScatter,
  BoxPlotCategorias,
  CategoriaTreemap,
  HeatmapCatMes,
  HierarquiaSunburst,
  MediaMensalLinhas,
  RadarDiaSemana,
} from '../components/chartsExtra';
import { brl, chartColors } from '../theme/tokens';

export function Categorias() {
  const total = categorias.reduce((s, c) => s + c.valor, 0);
  const ordenadas = [...categorias].sort((a, b) => b.valor - a.valor);

  return (
    <div className="space-y-4 p-6">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Distribuição por categoria" note="maio">
          <CategoryDonut />
        </Panel>
        <Panel title="Gasto por categoria" note="maio">
          <CategoryBar />
        </Panel>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Distribuição por categoria" note="treemap">
          <CategoriaTreemap />
        </Panel>
        <Panel title="Hierarquia de gastos" note="crédito × débito">
          <HierarquiaSunburst />
        </Panel>
      </section>

      <Panel title="Gastos por categoria e mês" note="heatmap">
        <HeatmapCatMes />
      </Panel>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Frequência × volume × ticket médio" note="bolha = ticket">
          <BolhasScatter />
        </Panel>
        <Panel title="Gastos por dia da semana" note="radar">
          <RadarDiaSemana />
        </Panel>
      </section>

      <Panel title="Evolução da média mensal por categoria" note="13 meses">
        <MediaMensalLinhas />
      </Panel>

      <Panel title="Distribuição estatística por categoria" note="box plot">
        <BoxPlotCategorias />
      </Panel>

      <Panel title="Detalhamento" note={`total ${brl(total)}`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-graphite">
              <th className="label-stencil pb-2 text-[0.6rem]">Categoria</th>
              <th className="label-stencil pb-2 text-right text-[0.6rem]">Valor</th>
              <th className="label-stencil pb-2 text-right text-[0.6rem]">% do total</th>
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((c, i) => (
              <tr key={c.nome} className="border-b border-graphite/50 last:border-0 hover:bg-graphite/30">
                <td className="py-2.5">
                  <span className="inline-flex items-center gap-2 text-bone">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ background: chartColors[i % chartColors.length] }}
                    />
                    {c.nome}
                  </span>
                </td>
                <td className="value py-2.5 text-right text-bone">{brl(c.valor)}</td>
                <td className="value py-2.5 text-right text-ash">
                  {((c.valor / total) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
