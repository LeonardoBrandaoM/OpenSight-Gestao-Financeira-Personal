// Integração da Overview com o analytics-service (agregações do dashboard).
import { apiGet, services } from '@/shared/api/client';

export interface AnalyticsOverview {
  balanceSeries: { mes: string; saldo: number }[];
  cashflow: { mes: string; receita: number; despesa: number }[];
  byCategory: { nome: string; valor: number }[];
  resumo: { receitasMes: number; despesasMes: number; economiaMes: number };
}

export async function fetchAnalyticsOverview(signal?: AbortSignal): Promise<AnalyticsOverview> {
  return apiGet<AnalyticsOverview>(services.analytics, '/api/v1/analytics/overview', { signal });
}
