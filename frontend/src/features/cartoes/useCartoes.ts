import { useEffect, useState } from 'react';
import { cartaoResumo, faturaHistorico, cartaoPorCategoria, cartaoLancamentos } from './data';
import { fetchCardsOverview, type CardsOverview } from './api';

const fallback: CardsOverview = {
  resumo: cartaoResumo,
  faturaHistorico,
  porCategoria: cartaoPorCategoria,
  lancamentos: cartaoLancamentos,
};

// Cartões do cards-service; inicia com mock (sem flash), cai nele em falha.
export function useCartoes(): { data: CardsOverview } {
  const [data, setData] = useState<CardsOverview>(fallback);
  useEffect(() => {
    const ctrl = new AbortController();
    fetchCardsOverview(ctrl.signal)
      .then(setData)
      .catch(() => {
        /* mantém fallback */
      });
    return () => ctrl.abort();
  }, []);
  return { data };
}
