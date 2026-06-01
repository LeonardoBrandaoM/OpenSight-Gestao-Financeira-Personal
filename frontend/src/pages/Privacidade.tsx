import { consentimentos, type Consentimento } from '../data/mock';
import { Panel } from '../components/ui';

const statusTom: Record<Consentimento['status'], { cor: string; label: string }> = {
  ativo: { cor: '#2FA572', label: 'Ativo' },
  expirando: { cor: '#E8A317', label: 'Expirando' },
  revogado: { cor: '#E5484D', label: 'Revogado' },
};

export function Privacidade() {
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

      <Panel title="Consentimentos Open Finance">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-graphite">
              <th className="label-stencil pb-2 text-[0.6rem]">Instituição</th>
              <th className="label-stencil pb-2 text-[0.6rem]">Escopos</th>
              <th className="label-stencil pb-2 text-[0.6rem]">Concedido</th>
              <th className="label-stencil pb-2 text-[0.6rem]">Status</th>
              <th className="label-stencil pb-2 text-right text-[0.6rem]">Expira em</th>
            </tr>
          </thead>
          <tbody>
            {consentimentos.map((c, i) => {
              const t = statusTom[c.status];
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
                  <td className={`value py-2.5 text-right ${c.expiraEm <= 21 ? 'text-warning' : 'text-bone'}`}>
                    {c.expiraEm}d
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>

      <Panel title="Seus direitos (LGPD)">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="rounded-md border border-graphite bg-obsidian px-4 py-2 text-sm text-bone transition-colors hover:border-brass hover:text-brass">
            Exportar meus dados (JSON + CSV)
          </button>
          <button className="rounded-md border border-loss/50 bg-loss/10 px-4 py-2 text-sm text-loss transition-colors hover:bg-loss/20">
            Excluir minha conta
          </button>
        </div>
        <p className="mt-3 text-xs text-ash">
          A exclusão é em cascata por todos os serviços (SLA de 72 h) e exige reautenticação. Um registro
          anonimizado é retido por 5 anos para auditoria, sem PII.
        </p>
      </Panel>
    </div>
  );
}
