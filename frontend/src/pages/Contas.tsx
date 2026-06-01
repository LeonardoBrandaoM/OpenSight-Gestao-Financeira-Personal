import { contas } from '../data/mock';
import { DeltaChip } from '../components/ui';
import { brl } from '../theme/tokens';

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-5">
      <div className="label-stencil text-[0.65rem]">{label}</div>
      <div className="value mt-2 text-2xl font-semibold text-bone">{value}</div>
    </div>
  );
}

export function Contas() {
  const total = contas.reduce((s, c) => s + c.saldo, 0);
  const instituicoes = new Set(contas.map((c) => c.instituicao)).size;

  return (
    <div className="space-y-4 p-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MiniStat label="Patrimônio total" value={brl(total)} />
        <MiniStat label="Contas conectadas" value={String(contas.length)} />
        <MiniStat label="Instituições" value={String(instituicoes)} />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contas.map((c, i) => {
          const negativo = c.saldo < 0;
          return (
            <div key={i} className="panel p-5">
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
            </div>
          );
        })}
      </section>
    </div>
  );
}
