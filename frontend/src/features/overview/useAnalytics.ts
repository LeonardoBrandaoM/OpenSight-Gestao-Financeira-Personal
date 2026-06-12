import { useEffect, useState } from 'react';
import { fetchAnalyticsOverview, type AnalyticsOverview } from './api';

export interface AnalyticsState {
  data: AnalyticsOverview | null; // null = ainda carregando ou indisponível (usar mock)
  loading: boolean;
}

// Busca as agregações do analytics-service; em falha, deixa `data` nulo e os
// gráficos caem no default (mock).
export function useAnalytics(): AnalyticsState {
  const [state, setState] = useState<AnalyticsState>({ data: null, loading: true });

  useEffect(() => {
    const ctrl = new AbortController();
    fetchAnalyticsOverview(ctrl.signal)
      .then((data) => setState({ data, loading: false }))
      .catch(() => {
        if (ctrl.signal.aborted) return;
        setState({ data: null, loading: false });
      });
    return () => ctrl.abort();
  }, []);

  return state;
}
