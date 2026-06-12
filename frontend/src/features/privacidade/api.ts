// Integração da feature Privacidade com o consent-service e o privacy-service.
import { apiGet, apiPost, services } from '@/shared/api/client';
import type { Consentimento } from './data';

interface ConsentsResponse {
  results: Consentimento[];
}

export async function fetchConsentimentos(signal?: AbortSignal): Promise<Consentimento[]> {
  const data = await apiGet<ConsentsResponse>(services.consent, '/api/v1/consents', { signal });
  return data.results;
}

// Direitos do titular LGPD (privacy-service): portabilidade/eliminação.
export type TipoSolicitacao = 'export' | 'delete';

export interface Solicitacao {
  id: string;
  tipo: TipoSolicitacao;
  status: string;
  criadoEm: string;
}

export async function solicitarDireito(tipo: TipoSolicitacao): Promise<Solicitacao> {
  return apiPost<Solicitacao>(services.privacy, '/api/v1/privacy/requests', { tipo });
}
