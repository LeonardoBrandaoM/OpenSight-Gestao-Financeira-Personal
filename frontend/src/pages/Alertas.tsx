import { alertas, anomalias, type Alerta } from '../data/mock';
import { Panel } from '../components/ui';
import { AnomaliasScatter } from '../components/chartsExtra';

const tom: Record<Alerta['severidade'], { cor: string; label: string }> = {
  critico: { cor: '#E5484D', label: 'Crítico' },
  atencao: { cor: '#E8A317', label: 'Atenção' },
  info: { cor: '#5A92B0', label: 'Info' },
};

export function Alertas() {
  const totalAnomalias = anomalias.filter((a) => a.anomalia).length;
  return (
    <div className="space-y-4 p-6">
      <Panel
        title="Detecção de anomalias (Z-Score)"
        note={
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-ember" />
            {totalAnomalias} anomalias (|z| {'>'} 2)
          </span>
        }
      >
        <AnomaliasScatter />
      </Panel>

      <div className="space-y-3">
      {alertas.map((a, i) => {
        const t = tom[a.severidade];
        return (
          <div
            key={i}
            className="panel flex items-start gap-4 border-l-4 p-4"
            style={{ borderLeftColor: t.cor }}
          >
            <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: t.cor }} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display font-semibold text-bone">{a.titulo}</span>
                <span
                  className="rounded px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider"
                  style={{ color: t.cor, background: `${t.cor}1A` }}
                >
                  {a.tipo}
                </span>
              </div>
              <p className="mt-1 text-sm text-ash">{a.detalhe}</p>
            </div>
            <span className="value shrink-0 text-xs text-steel">{a.quando}</span>
          </div>
        );
      })}
      </div>
    </div>
  );
}
