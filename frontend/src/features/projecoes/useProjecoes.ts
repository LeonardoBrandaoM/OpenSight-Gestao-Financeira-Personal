import { useEffect, useState } from 'react';
import { projecao } from './data';
import { fetchProjecoes, type Cenario } from './api';

// Cenários do projection-service; inicia com o mock (sem flash) e cai nele em falha.
export function useProjecoes(): { cenarios: Cenario[]; loading: boolean } {
  const [state, setState] = useState<{ cenarios: Cenario[]; loading: boolean }>({
    cenarios: projecao,
    loading: true,
  });

  useEffect(() => {
    const ctrl = new AbortController();
    fetchProjecoes(ctrl.signal)
      .then((cenarios) => setState({ cenarios, loading: false }))
      .catch(() => {
        if (ctrl.signal.aborted) return;
        setState({ cenarios: projecao, loading: false });
      });
    return () => ctrl.abort();
  }, []);

  return state;
}
