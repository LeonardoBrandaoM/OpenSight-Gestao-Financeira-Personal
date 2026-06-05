import { useEffect, useState } from 'react';
import { budgets, sugestoesOrcamento, gastoPorCategoria, comprometimento } from './data';
import { fetchBudgetOverview, type BudgetOverview } from './api';

const fallback: BudgetOverview = {
  metas: budgets,
  sugestoes: sugestoesOrcamento,
  gastoPorCategoria,
  comprometimento,
};

// Orçamento do budget-service; inicia com mock (sem flash), cai nele em falha.
export function useBudget(): { data: BudgetOverview; loading: boolean } {
  const [state, setState] = useState<{ data: BudgetOverview; loading: boolean }>({ data: fallback, loading: true });

  useEffect(() => {
    const ctrl = new AbortController();
    fetchBudgetOverview(ctrl.signal)
      .then((data) => setState({ data, loading: false }))
      .catch(() => {
        if (ctrl.signal.aborted) return;
        setState({ data: fallback, loading: false });
      });
    return () => ctrl.abort();
  }, []);

  return state;
}
