// Integração da feature Cartões com o cards-service.
import { apiGet, services } from '@/shared/api/client';
import type { LancamentoCartao } from './data';

export interface CartaoResumo {
  instituicao: string;
  apelido: string;
  limiteTotal: number;
  faturaAtual: number;
  vencimento: string;
  fechamento: string;
  melhorDiaCompra: string;
}

export interface CardsOverview {
  resumo: CartaoResumo;
  faturaHistorico: { mes: string; valor: number }[];
  porCategoria: { nome: string; valor: number }[];
  lancamentos: LancamentoCartao[];
}

export async function fetchCardsOverview(signal?: AbortSignal): Promise<CardsOverview> {
  return apiGet<CardsOverview>(services.cards, '/api/v1/cards/overview', { signal });
}
