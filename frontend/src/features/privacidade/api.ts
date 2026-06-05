// Integração da feature Privacidade com o consent-service.
import { apiGet, services } from '@/shared/api/client';
import type { Consentimento } from './data';

interface ConsentsResponse {
  results: Consentimento[];
}

export async function fetchConsentimentos(signal?: AbortSignal): Promise<Consentimento[]> {
  const data = await apiGet<ConsentsResponse>(services.consent, '/api/v1/consents', { signal });
  return data.results;
}
