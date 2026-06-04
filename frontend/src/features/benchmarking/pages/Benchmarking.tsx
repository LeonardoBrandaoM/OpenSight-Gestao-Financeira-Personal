import { Link } from 'react-router-dom';
import { cohort } from '@/data/mock';
import { Panel } from '@/shared/ui';
import { useConsent } from '@/shared/context/consent';

const trajetoriaTom: Record<typeof cohort.trajetoria, { cor: string; label: string }> = {
  melhorou: { cor: '#2FA572', label: 'Melhorou' },
  estavel: { cor: '#E8A317', label: 'Estável' },
  decaiu: { cor: '#E5484D', label: 'Decaiu' },
};

function MiniStat({ label, value, tone = 'bone' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="panel p-5">
      <div className="label-stencil text-[0.65rem]">{label}</div>
      <div className={`value mt-2 text-2xl font-semibold text-${tone}`}>{value}</div>
    </div>
  );
}

// Barra comparativa "você vs. mediana dos pares".
function CompareRow({
  metrica,
  voce,
  mediana,
  unidade,
  maiorMelhor,
}: {
  metrica: string;
  voce: number;
  mediana: number;
  unidade: string;
  maiorMelhor: boolean;
}) {
  const max = Math.max(voce, mediana) * 1.15 || 1;
  const melhor = maiorMelhor ? voce >= mediana : voce <= mediana;
  const corVoce = melhor ? 'bg-gain' : 'bg-loss';
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm text-bone">{metrica}</span>
        <span className="value text-xs text-ash">
          você <span className={melhor ? 'text-gain' : 'text-loss'}>{voce}{unidade.startsWith('%') ? '%' : ''}</span>{' '}
          · mediana <span className="text-bone">{mediana}{unidade.startsWith('%') ? '%' : ''}</span>
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[0.6rem] uppercase tracking-wider text-ash">você</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-graphite">
            <div className={`h-full rounded-full ${corVoce}`} style={{ width: `${(voce / max) * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[0.6rem] uppercase tracking-wider text-ash">pares</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-graphite">
            <div className="h-full rounded-full bg-steel" style={{ width: `${(mediana / max) * 100}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-1 text-right text-[0.6rem] text-ash">{unidade}</div>
    </div>
  );
}

export function Benchmarking() {
  const { benchmarking, set } = useConsent();

  // Gate: sem consentimento, mostra a explicação e o opt-in.
  if (!benchmarking) {
    return (
      <div className="space-y-4 p-6">
        <div className="panel border-l-4 border-l-brass p-6">
          <div className="label-stencil text-[0.65rem] !text-brass">Recurso opt-in · desligado por padrão</div>
          <h2 className="mt-2 font-display text-2xl font-bold text-bone">Compare-se com pares da sua faixa</h2>
          <p className="mt-2 max-w-2xl text-sm text-ash">
            Ao ativar o benchmarking, seus dados entram em uma <span className="text-bone">coorte anonimizada</span>{' '}
            de usuários da mesma faixa de renda. Você passa a ver como sua taxa de poupança, cumprimento de metas e
            gastos se comparam à mediana de quem alcançou seus objetivos — e recebe recomendações baseadas nesses
            pares. Você <span className="text-bone">nunca</span> vê dados individuais de outra pessoa.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-ash">
            <li>• Dados sempre agregados e anonimizados (k-anonimato mínimo de {cohort.kMinimo} pares).</li>
            <li>• Reversível: ao desativar, seus dados saem das bases de coorte (exclusão em cascata).</li>
            <li>• Também habilita a projeção inteligente em <Link to="/projecoes" className="text-brass underline-offset-2 hover:underline">Projeções</Link>.</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => set('benchmarking', true)}
              className="rounded-md border border-crimson bg-crimson/15 px-4 py-2 text-sm font-semibold text-bone transition hover:bg-crimson/25"
            >
              Ativar benchmarking
            </button>
            <Link
              to="/privacidade"
              className="rounded-md border border-graphite bg-obsidian px-4 py-2 text-sm text-ash transition-colors hover:border-brass hover:text-brass"
            >
              Gerenciar consentimentos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const t = trajetoriaTom[cohort.trajetoria];
  const sucessos = cohort.drivers.filter((d) => d.tipo === 'sucesso');
  const fracassos = cohort.drivers.filter((d) => d.tipo === 'fracasso');

  return (
    <div className="space-y-4 p-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MiniStat label="Sua faixa de renda" value={cohort.faixaRenda} />
        <MiniStat label="Pares na coorte" value={`${cohort.membros.toLocaleString('pt-BR')}`} />
        <div className="panel p-5">
          <div className="label-stencil text-[0.65rem]">Sua trajetória</div>
          <div className="value mt-2 text-2xl font-semibold" style={{ color: t.cor }}>{t.label}</div>
          <div className="text-xs text-ash">
            {cohort.taxaCumprimentoVoce}% de metas cumpridas · mediana {cohort.taxaCumprimentoMediana}%
          </div>
        </div>
      </section>

      <Panel title="Você vs. pares bem-sucedidos" note={`faixa ${cohort.faixaRenda}`}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {cohort.comparativos.map((c) => (
            <CompareRow key={c.metrica} {...c} />
          ))}
        </div>
      </Panel>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="O que leva ao sucesso" note="drivers">
          <ul className="space-y-2">
            {sucessos.map((d, i) => (
              <li key={i} className="flex gap-2 text-sm text-ash">
                <span className="text-gain">▲</span>
                <span>{d.texto}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="O que leva ao fracasso" note="drivers">
          <ul className="space-y-2">
            {fracassos.map((d, i) => (
              <li key={i} className="flex gap-2 text-sm text-ash">
                <span className="text-loss">▼</span>
                <span>{d.texto}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <Panel title="Recomendações baseadas em pares" note="quem alcançou as metas">
        <ul className="space-y-2">
          {cohort.recomendacoes.map((r, i) => (
            <li key={i} className="flex items-start gap-3 rounded-md border border-graphite bg-obsidian/60 p-3 text-sm text-bone">
              <span className="reactor-dot mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-brass" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-xs text-ash">
          Comparações usam apenas dados agregados e anonimizados, com privacidade diferencial e k-anonimato mínimo
          de {cohort.kMinimo} pares (RNF-013). Nenhum dado individual de outro usuário é exposto.
        </p>
        <button
          type="button"
          onClick={() => set('benchmarking', false)}
          className="rounded-md border border-loss/50 bg-loss/10 px-3 py-1.5 text-xs font-medium text-loss transition-colors hover:bg-loss/20"
        >
          Sair da coorte
        </button>
      </div>
    </div>
  );
}
