import { projecao } from '../data/mock';
import { Panel } from '../components/ui';
import { ProjectionLines } from '../components/charts';
import { brl } from '../theme/tokens';

function ScenarioCard({ label, value, tone, dashed }: { label: string; value: number; tone: string; dashed?: boolean }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-0.5 w-5 ${dashed ? 'border-t-2 border-dashed' : ''}`}
          style={dashed ? { borderColor: tone } : { background: tone }}
        />
        <span className="label-stencil text-[0.65rem]">{label}</span>
      </div>
      <div className="value mt-2 text-2xl font-semibold" style={{ color: tone }}>
        {brl(value)}
      </div>
      <div className="text-xs text-ash">projeção em 6 meses</div>
    </div>
  );
}

export function Projecoes() {
  const ultimo = projecao[projecao.length - 1];

  return (
    <div className="space-y-4 p-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ScenarioCard label="Otimista" value={ultimo.otimista} tone="#2FA572" dashed />
        <ScenarioCard label="Realista" value={ultimo.realista} tone="#F03A24" />
        <ScenarioCard label="Pessimista" value={ultimo.pessimista} tone="#E5484D" dashed />
      </section>

      <Panel title="Projeção de patrimônio" note="cenários · 6 meses">
        <ProjectionLines />
      </Panel>

      <p className="text-xs text-ash">
        As projeções requerem no mínimo 60 dias de histórico ou 20 transações para serem confiáveis.
        Cenários derivam de tendências, recorrências e sazonalidade detectadas.
      </p>
    </div>
  );
}
