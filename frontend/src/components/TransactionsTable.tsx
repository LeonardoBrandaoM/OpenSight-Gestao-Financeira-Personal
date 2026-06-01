import { transacoes as todasTransacoes, type Transacao } from '../data/mock';
import { brl } from '../theme/tokens';

export function TransactionsTable({ data = todasTransacoes }: { data?: Transacao[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-ash">Nenhuma transação encontrada.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-graphite">
            {['Data', 'Descrição', 'Categoria', 'Conta', 'Valor'].map((h, i) => (
              <th
                key={h}
                className={`label-stencil pb-2 text-[0.6rem] ${i === 4 ? 'text-right' : ''}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((t, i) => (
            <tr key={i} className="border-b border-graphite/50 last:border-0 hover:bg-graphite/30">
              <td className="value py-2.5 pr-4 text-ash">{t.data}</td>
              <td className="py-2.5 pr-4 text-bone">{t.descricao}</td>
              <td className="py-2.5 pr-4">
                <span className="rounded border border-graphite bg-obsidian px-2 py-0.5 text-xs text-ash">
                  {t.categoria}
                </span>
              </td>
              <td className="py-2.5 pr-4 text-ash">{t.conta}</td>
              <td className={`value py-2.5 text-right ${t.valor >= 0 ? 'text-gain' : 'text-loss'}`}>
                {t.valor >= 0 ? '+' : '−'}
                {brl(Math.abs(t.valor))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
