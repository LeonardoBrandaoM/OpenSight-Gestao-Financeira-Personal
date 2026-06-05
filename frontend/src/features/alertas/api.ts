// Integração da feature Alertas com o notification-service.
import { apiGet, services } from '@/shared/api/client';
import type { Alerta } from './data';

interface NotificationsResponse {
  results: Alerta[];
}

export async function fetchAlertas(signal?: AbortSignal): Promise<Alerta[]> {
  const data = await apiGet<NotificationsResponse>(services.notification, '/api/v1/notifications', { signal });
  return data.results;
}

// Scatter de detecção de anomalias (precompute do analytics-service).
export interface PontoAnomalia {
  x: number;
  valor: number;
  tipo: 'DEBIT' | 'CREDIT';
  anomalia: boolean;
}

interface AnomaliesResponse {
  results: PontoAnomalia[];
}

export async function fetchAnomalias(signal?: AbortSignal): Promise<PontoAnomalia[]> {
  const data = await apiGet<AnomaliesResponse>(services.analytics, '/api/v1/analytics/anomalies', { signal });
  return data.results;
}
