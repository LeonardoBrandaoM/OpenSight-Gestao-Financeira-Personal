// Integração da feature Benchmarking com o cohort-service.
import { apiGet, services } from '@/shared/api/client';
import { cohort } from './data';

export type Cohort = typeof cohort;

export async function fetchCohort(signal?: AbortSignal): Promise<Cohort> {
  return apiGet<Cohort>(services.cohort, '/api/v1/cohort/overview', { signal });
}
