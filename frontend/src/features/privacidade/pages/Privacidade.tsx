import { useState } from 'react';
import { type Consentimento } from '@/data/mock';
import { Panel } from '@/shared/ui';
import { useConsent, type ConsentState } from '@/shared/context/consent';
import { useConsentimentos } from '../useConsentimentos';
import { solicitarDireito, type TipoSolicitacao } from '../api';

const statusTom: Record<Consentimento['status'], { cor: string; label: string }> = {
  ativo: { cor: '#2FA572', label: 'Ativo' },
  expirando: { cor: '#E8A317', label: 'Expirando' },
  revogado: { cor: '#E5484D', label: 'Revogado' },
};

// Interruptor acessível para os consentimentos da plataforma (LGPD Tipo A).
function Switch({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onToggle}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        on ? 'bg-gain' : 'bg-graphite'
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-bone transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

const togglesPlataforma: { chave: keyof ConsentState; titulo: string; desc: string; essencial?: boolean }[] = [
  { chave: 'processamento', titulo: 'Processamento de dados', desc: 'Necessário para o funcionamento do serviço.', essencial: true },
  { chave: 'analytics', titulo: 'Analytics pessoal', desc: 'Gráficos, tendências e detecção de anomalias na sua conta.' },
  { chave: 'treinamentoML', titulo: 'Treino de modelos (anonimizado)', desc: 'Melhora a categorização automática a partir de dados anonimizados.' },
  { chave: 'benchmarking', titulo: 'Benchmarking de pares', desc: 'Entrar na coorte anonimizada da sua faixa de renda para comparações e recomendações (RF-012). Desligado por padrão.' },
  { chave: 'comunicacoes', titulo: 'Comunicações por email', desc: 'Relatórios periódicos e avisos importantes.' },
];

export function Privacidade() {
  const consent = useConsent();
  const { consentimentos } = useConsentimentos();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<TipoSolicitacao | null>(null);

  const pedir = async (tipo: TipoSolicitacao) => {
    setEnviando(tipo);
    setFeedback(null);
    try {
      await solicitarDireito(tipo);
      setFeedback(
        tipo === 'export'
          ? 'Solicitação de exportação registrada — você receberá os dados por email em até 72 h.'
          : 'Solicitação de exclusão registrada — processada em cascata em até 72 h.',
      );
    } catch {
      setFeedback('Não foi possível registrar a solicitação agora. Tente novamente mais tarde.');
    } finally {
      setEnviando(null);
    }
  };

  return (
    <div className="space-y-4 p-6">
      {/* Banner READ-ONLY */}
      <div className="panel flex items-center gap-3 border-l-4 border-l-brass p-4">
        <span className="reactor-dot inline-block h-2 w-2 rounded-full bg-brass" />
        <div>
          <div className="label-stencil text-[0.65rem] !text-brass">Acesso somente leitura</div>
          <p className="text-sm text-ash">
            O OpenSight vê seus dados para protegê-los — nunca para movimentá-los. Nenhuma transferência,
            pagamento ou investimento é possível.
          </p>
        </div>
      </div>

      <Panel
        title="Instituições conectadas"
        note={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-brass/50 bg-brass/10 px-3 py-1.5 text-xs font-semibold text-brass transition-colors hover:bg-brass/20"
          >
            <span aria-hidden className="text-sm leading-none">+</span>
            Conectar novas contas
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-graphite">
                <th className="label-stencil pb-2 text-[0.6rem]">Instituição</th>
                <th className="label-stencil pb-2 text-[0.6rem]">Escopos</th>
                <th className="label-stencil pb-2 text-[0.6rem]">Concedido</th>
                <th className="label-stencil pb-2 text-[0.6rem]">Status</th>
                <th className="label-stencil pb-2 text-right text-[0.6rem]">Expira em</th>
                <th className="label-stencil pb-2 text-right text-[0.6rem]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {consentimentos.map((c, i) => {
                const t = statusTom[c.status];
                const revogado = c.status === 'revogado';
                return (
                  <tr key={i} className="border-b border-graphite/50 last:border-0 hover:bg-graphite/30">
                    <td className="py-2.5 pr-4 font-medium text-bone">{c.instituicao}</td>
                    <td className="py-2.5 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {c.escopos.map((e) => (
                          <span key={e} className="value rounded border border-graphite bg-obsidian px-1.5 py-0.5 text-[0.6rem] text-ash">
                            {e}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="value py-2.5 pr-4 text-ash">{c.concedidoEm}</td>
                    <td className="py-2.5 pr-4">
                      <span className="rounded px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider" style={{ color: t.cor, background: `${t.cor}1A` }}>
                        {t.label}
                      </span>
                    </td>
                    <td className={`value py-2.5 pr-4 text-right ${c.expiraEm <= 21 ? 'text-warning' : 'text-bone'}`}>
                      {c.expiraEm}d
                    </td>
                    <td className="py-2.5">
                      <div className="flex justify-end gap-2 whitespace-nowrap">
                        <button
                          type="button"
                          title="Renovar consentimento"
                          className="rounded border border-gain/50 bg-gain/10 px-2.5 py-1 text-[0.7rem] font-medium text-gain transition-colors hover:bg-gain/20"
                        >
                          Renovar
                        </button>
                        <button
                          type="button"
                          title="Revogar consentimento"
                          disabled={revogado}
                          className="rounded border border-loss/50 bg-loss/10 px-2.5 py-1 text-[0.7rem] font-medium text-loss transition-colors hover:bg-loss/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-loss/10"
                        >
                          Revogar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Consentimentos da plataforma" note="LGPD · granular">
        <ul className="divide-y divide-graphite/60">
          {togglesPlataforma.map((t) => (
            <li key={t.chave} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div>
                <div className="flex items-center gap-2 text-sm text-bone">
                  {t.titulo}
                  {t.essencial && (
                    <span className="value rounded border border-graphite bg-obsidian px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wider text-ash">
                      essencial
                    </span>
                  )}
                </div>
                <p className="mt-0.5 max-w-xl text-xs text-ash">{t.desc}</p>
              </div>
              <Switch on={consent[t.chave]} onToggle={() => consent.toggle(t.chave)} disabled={t.essencial} />
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ash">
          O consentimento de benchmarking pode ser revogado a qualquer momento; ao desligá-lo, seus dados são
          removidos das bases de coorte (exclusão em cascata, sem PII retida).
        </p>
      </Panel>

      <Panel title="Seus direitos (LGPD)">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => pedir('export')}
            disabled={enviando !== null}
            className="rounded-md border border-graphite bg-obsidian px-4 py-2 text-sm text-bone transition-colors hover:border-brass hover:text-brass disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando === 'export' ? 'Registrando…' : 'Exportar meus dados (JSON + CSV)'}
          </button>
          <button
            type="button"
            onClick={() => pedir('delete')}
            disabled={enviando !== null}
            className="rounded-md border border-loss/50 bg-loss/10 px-4 py-2 text-sm text-loss transition-colors hover:bg-loss/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando === 'delete' ? 'Registrando…' : 'Excluir minha conta'}
          </button>
        </div>
        {feedback && <p className="mt-3 rounded border border-brass/40 bg-brass/10 p-2.5 text-xs text-bone">{feedback}</p>}
        <p className="mt-3 text-xs text-ash">
          A exclusão é em cascata por todos os serviços (SLA de 72 h) e exige reautenticação. Um registro
          anonimizado é retido por 5 anos para auditoria, sem PII.
        </p>
      </Panel>
    </div>
  );
}
