import { useEffect, useState } from 'react';
import { alertas as mock, type Alerta } from './data';
import { fetchAlertas } from './api';

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
