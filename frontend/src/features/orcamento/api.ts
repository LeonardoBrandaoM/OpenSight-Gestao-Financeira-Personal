// Integração da feature Orçamento com o budget-service.
import { apiGet, services } from '@/shared/api/client';
import type { Budget, SugestaoOrcamento } from './data';

export interface BudgetOverview {
  metas: Budget[];
  sugestoes: SugestaoOrcamento[];
  gastoPorCategoria: Record<string, number>;
  comprometimento: {
    pct: number;
    comprometido: number;
    receitas: number;
    saldoLiquido: number;
    status: string;
  };
}

export async function fetchBudgetOverview(signal?: AbortSignal): Promise<BudgetOverview> {
  return apiGet<BudgetOverview>(services.budget, '/api/v1/budget/overview', { signal });
}
