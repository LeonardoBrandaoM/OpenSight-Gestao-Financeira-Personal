import { useEffect, useState } from 'react';
import { alertas as mock, type Alerta } from './data';
import { anomalias as anomaliasMock } from '@/data/mock';
import { fetchAlertas, fetchAnomalias, type PontoAnomalia } from './api';

// Alertas do notification-service; inicia com mock (sem flash), mantém em falha.
export function useAlertas(): { alertas: Alerta[] } {
  const [list, setList] = useState<Alerta[]>(mock);
  useEffect(() => {
    const ctrl = new AbortController();
    fetchAlertas(ctrl.signal)
      .then(setList)
      .catch(() => {
        /* mantém mock */
      });
    return () => ctrl.abort();
  }, []);
  return { alertas: list };
}

// Anomalias do analytics-service (scatter z-score); fallback ao mock.
export function useAnomalias(): { anomalias: PontoAnomalia[] } {
  const [list, setList] = useState<PontoAnomalia[]>(anomaliasMock);
  useEffect(() => {
    const ctrl = new AbortController();
    fetchAnomalias(ctrl.signal)
      .then(setList)
      .catch(() => {
        /* mantém mock */
      });
    return () => ctrl.abort();
  }, []);
  return { anomalias: list };
}
