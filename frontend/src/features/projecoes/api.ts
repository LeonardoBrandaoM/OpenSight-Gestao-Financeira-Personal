// Integração da feature Projeções com o projection-service.
import { apiGet, services } from '@/shared/api/client';
import { projecao } from './data';

export type Cenario = (typeof projecao)[number]; // { mes, otimista, realista, pessimista, ajustado }

interface ProjectionsResponse {
  cenarios: Cenario[];
}

export async function fetchProjecoes(signal?: AbortSignal): Promise<Cenario[]> {
  const data = await apiGet<ProjectionsResponse>(services.projection, '/api/v1/projections', { signal });
  return data.cenarios;
}
