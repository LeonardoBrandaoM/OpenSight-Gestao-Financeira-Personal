// Integração da feature Investimentos com o investments-service.
import { apiGet, services } from '@/shared/api/client';
import type { PosicaoInvest } from './data';

export interface InvestResumo {
  total: number;
  rendimentoMes: number;
  rentabilidade12m: number;
  aporteMes: number;
}

export interface InvestmentsOverview {
  resumo: InvestResumo;
  alocacao: { classe: string; valor: number }[];
  evolucao: { mes: string; valor: number }[];
  rendimentoPorClasse: { classe: string; rendimento: number }[];
  posicoes: PosicaoInvest[];
}

export async function fetchInvestmentsOverview(signal?: AbortSignal): Promise<InvestmentsOverview> {
  return apiGet<InvestmentsOverview>(services.investments, '/api/v1/investments/overview', { signal });
}
