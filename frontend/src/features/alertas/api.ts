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
