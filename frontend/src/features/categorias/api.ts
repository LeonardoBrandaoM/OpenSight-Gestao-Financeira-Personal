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
