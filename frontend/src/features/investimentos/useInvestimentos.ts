import { useEffect, useState } from 'react';
import { investResumo, carteiraAlocacao, carteiraEvolucao, rendimentoPorClasse, posicoes } from './data';
import { fetchInvestmentsOverview, type InvestmentsOverview } from './api';

const fallback: InvestmentsOverview = {
  resumo: investResumo,
  alocacao: carteiraAlocacao,
  evolucao: carteiraEvolucao,
  rendimentoPorClasse,
  posicoes,
};

// Carteira do investments-service; inicia com mock (sem flash), cai nele em falha.
export function useInvestimentos(): { data: InvestmentsOverview } {
  const [data, setData] = useState<InvestmentsOverview>(fallback);
  useEffect(() => {
    const ctrl = new AbortController();
    fetchInvestmentsOverview(ctrl.signal)
      .then(setData)
      .catch(() => {
        /* mantém fallback */
      });
    return () => ctrl.abort();
  }, []);
  return { data };
}
