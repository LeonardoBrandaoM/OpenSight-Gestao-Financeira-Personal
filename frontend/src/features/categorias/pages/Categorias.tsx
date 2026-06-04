import { useState } from 'react';
import {
  categorias,
  categoriasCadastro,
  paletaCategoria,
  tiposTransacao,
  type CategoriaCadastro,
  type EfeitoFluxo,
  type TipoCategoria,
  type TipoTransacao,
} from '@/data/mock';
import { Panel } from '@/shared/ui';
import {
  BolhasScatter,
  CategoriaTreemap,
  CategoryBar,
  CategoryDonut,
  HeatmapCatMes,
  HierarquiaSunburst,
  MediaMensalLinhas,
  RadarDiaSemana,
} from '@/shared/charts';
import { brl, chartColors } from '@/shared/theme/tokens';

const efeitoTom: Record<EfeitoFluxo, { cor: string; label: string }> = {
  entra: { cor: '#2FA572', label: 'entra' },
  sai: { cor: '#E5484D', label: 'sai' },
  neutro: { cor: '#8C929C', label: 'neutro' },
};
const tiposCategoria: TipoCategoria[] = ['despesa', 'receita', 'transferencia'];
const efeitos: EfeitoFluxo[] = ['sai', 'entra', 'neutro'];

// Gestão de categorias e tipos de transação personalizados (RF-004).
function GerenciarCategorias() {
  const [cats, setCats] = useState<CategoriaCadastro[]>(categoriasCadastro);
  const [tipos, setTipos] = useState<TipoTransacao[]>(tiposTransacao);

  const [nome, setNome] = useState('');
  const [tipoCat, setTipoCat] = useState<TipoCategoria>('despesa');
  const [cor, setCor] = useState(paletaCategoria[0]);

  const [tNome, setTNome] = useState('');
  const [tEfeito, setTEfeito] = useState<EfeitoFluxo>('sai');

  const addCategoria = () => {
    const n = nome.trim();
    if (!n) return;
    setCats((c) => [...c, { id: `c-${Date.now()}`, nome: n, cor, tipo: tipoCat, base: false }]);
    setNome('');
  };
  const addTipo = () => {
    const n = tNome.trim();
    if (!n) return;
    setTipos((t) => [...t, { id: `t-${Date.now()}`, nome: n, efeito: tEfeito, base: false }]);
    setTNome('');
  };

  const inputCls =
    'rounded border border-graphite bg-graphite/30 px-2 py-1.5 text-sm text-bone outline-none focus:border-brass';

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel title="Categorias" note={`${cats.length} cadastradas`}>
        <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {cats.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded border border-graphite/50 bg-obsidian/40 px-2.5 py-1.5">
              <span className="inline-block h-3 w-3 shrink-0 rounded-sm" style={{ background: c.cor }} />
              <span className="text-sm text-bone">{c.nome}</span>
              {c.pai && <span className="text-[0.6rem] text-ash">↳ {c.pai}</span>}
              <span className="value ml-auto rounded border border-graphite bg-obsidian px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wider text-ash">
                {c.tipo}
              </span>
              {c.base ? (
                <span className="text-[0.55rem] uppercase tracking-wider text-steel">base</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setCats((list) => list.filter((x) => x.id !== c.id))}
                  className="text-ash transition hover:text-loss"
                  aria-label={`Remover ${c.nome}`}
                  title="Remover"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-graphite pt-3">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCategoria()}
            placeholder="Nova categoria"
            className={`${inputCls} min-w-0 flex-1`}
          />
          <select value={tipoCat} onChange={(e) => setTipoCat(e.target.value as TipoCategoria)} className={inputCls}>
            {tiposCategoria.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            {paletaCategoria.slice(0, 6).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCor(p)}
                aria-label={`Cor ${p}`}
                className={`h-5 w-5 rounded-sm ${cor === p ? 'ring-2 ring-bone ring-offset-1 ring-offset-gunmetal' : ''}`}
                style={{ background: p }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addCategoria}
            className="rounded border border-crimson bg-crimson/15 px-3 py-1.5 text-xs font-semibold text-bone transition hover:bg-crimson/25"
          >
            Adicionar
          </button>
        </div>
      </Panel>

      <Panel title="Tipos de transação" note={`${tipos.length} tipos`}>
        <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {tipos.map((t) => {
            const e = efeitoTom[t.efeito];
            return (
              <div key={t.id} className="flex items-center gap-2 rounded border border-graphite/50 bg-obsidian/40 px-2.5 py-1.5">
                <span className="text-sm text-bone">{t.nome}</span>
                <span className="ml-auto rounded px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider" style={{ color: e.cor, background: `${e.cor}1A` }}>
                  {e.label}
                </span>
                {t.base ? (
                  <span className="text-[0.55rem] uppercase tracking-wider text-steel">base</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTipos((list) => list.filter((x) => x.id !== t.id))}
                    className="text-ash transition hover:text-loss"
                    aria-label={`Remover ${t.nome}`}
                    title="Remover"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-graphite pt-3">
          <input
            value={tNome}
            onChange={(e) => setTNome(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTipo()}
            placeholder="Novo tipo"
            className={`${inputCls} min-w-0 flex-1`}
          />
          <select value={tEfeito} onChange={(e) => setTEfeito(e.target.value as EfeitoFluxo)} className={inputCls}>
            {efeitos.map((ef) => (
              <option key={ef} value={ef}>{efeitoTom[ef].label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addTipo}
            className="rounded border border-crimson bg-crimson/15 px-3 py-1.5 text-xs font-semibold text-bone transition hover:bg-crimson/25"
          >
            Adicionar
          </button>
        </div>
        <p className="mt-2 text-[0.65rem] text-ash">
          Efeito de fluxo: <span className="text-gain">entra</span> (receita), <span className="text-loss">sai</span>{' '}
          (despesa) ou <span className="text-ash">neutro</span> (não computa no fluxo).
        </p>
      </Panel>
    </section>
  );
}

export function Categorias() {
  const total = categorias.reduce((s, c) => s + c.valor, 0);
  const ordenadas = [...categorias].sort((a, b) => b.valor - a.valor);

  return (
    <div className="space-y-4 p-6">
      <GerenciarCategorias />

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
