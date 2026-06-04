import { useState } from 'react';
import { Link } from 'react-router-dom';
import { projecao } from '@/data/mock';
import { Panel } from '@/shared/ui';
import { ProjectionLines } from '@/shared/charts';
import { useConsent } from '@/shared/context/consent';
import { brl } from '@/shared/theme/tokens';

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
  const { benchmarking } = useConsent();
  // Só permite ver o ajuste por pares se houver consentimento de benchmarking.
  const [verPares, setVerPares] = useState(false);
  const ajusteAtivo = benchmarking && verPares;

  return (
    <div className="space-y-4 p-6">
      <section className={`grid grid-cols-1 gap-4 sm:grid-cols-3 ${ajusteAtivo ? 'lg:grid-cols-4' : ''}`}>
        <ScenarioCard label="Otimista" value={ultimo.otimista} tone="#2FA572" dashed />
        <ScenarioCard label="Realista" value={ultimo.realista} tone="#F03A24" />
        <ScenarioCard label="Pessimista" value={ultimo.pessimista} tone="#E5484D" dashed />
        {ajusteAtivo && <ScenarioCard label="Ajustado (pares)" value={ultimo.ajustado} tone="#C8962C" dashed />}
      </section>

      <Panel
        title="Projeção de patrimônio"
        note={
          benchmarking ? (
            <label className="flex cursor-pointer items-center gap-2 text-xs text-ash">
              <input
                type="checkbox"
                checked={verPares}
                onChange={(e) => setVerPares(e.target.checked)}
                className="accent-brass"
              />
              Ajuste por pares
            </label>
          ) : (
            'cenários · 6 meses'
          )
        }
      >
        <ProjectionLines peerAdjusted={ajusteAtivo} />
      </Panel>

      {benchmarking ? (
        <p className="text-xs text-ash">
          O método é <span className="text-bone">híbrido</span>: os três cenários são o baseline estatístico
          (médias ± 10%). A linha <span className="text-brass">Ajustado (pares)</span> refina a projeção realista
          com a trajetória mediana de pares bem-sucedidos da sua faixa de renda — sempre exibida ao lado do
          baseline.
        </p>
      ) : (
        <div className="panel border-l-4 border-l-brass p-4">
          <div className="label-stencil text-[0.65rem] !text-brass">Projeção inteligente disponível</div>
          <p className="mt-1 text-sm text-ash">
            Ative o <Link to="/benchmarking" className="text-brass underline-offset-2 hover:underline">benchmarking de pares</Link>{' '}
            para refinar a projeção realista com a trajetória de quem alcançou as metas na sua faixa de renda.
            Sem consentimento, apenas o baseline estatístico é exibido.
          </p>
        </div>
      )}

      <p className="text-xs text-ash">
        As projeções requerem no mínimo 60 dias de histórico ou 20 transações para serem confiáveis.
        Cenários derivam de tendências, recorrências e sazonalidade detectadas.
      </p>
    </div>
  );
}
