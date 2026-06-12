// Integração da feature Categorias com o categorization-service.
import { apiGet, services } from '@/shared/api/client';
import type { CategoriaCadastro, TipoTransacao } from './data';

export interface CategoriesOverview {
  breakdown: { nome: string; valor: number }[];
  cadastro: CategoriaCadastro[];
  tipos: TipoTransacao[];
}

export async function fetchCategoriesOverview(signal?: AbortSignal): Promise<CategoriesOverview> {
  return apiGet<CategoriesOverview>(services.categorization, '/api/v1/categories/overview', { signal });
}

// Read-model dos gráficos avançados (precompute do analytics-service).
export interface CategoryInsights {
  treemap: { nome: string; valor: number }[];
  hierarquiaInterna: { nome: string; valor: number }[];
  hierarquiaExterna: { nome: string; grupo: string; valor: number }[];
  heatCategorias: string[];
  heatmap: number[][];
  bolhas: { categoria: string; transacoes: number; volume: number; ticket: number }[];
  radar: { dia: string; valor: number }[];
  seriesMediaMensal: string[];
  mediaMensal: Record<string, number | string>[];
  boxplot: {
    categoria: string;
    min: number;
    q1: number;
    mediana: number;
    q3: number;
    max: number;
    outliers: number[];
  }[];
}

export async function fetchCategoryInsights(signal?: AbortSignal): Promise<CategoryInsights> {
  return apiGet<CategoryInsights>(services.analytics, '/api/v1/analytics/categories', { signal });
}
