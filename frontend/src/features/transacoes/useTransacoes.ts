import { useEffect, useState } from 'react';
import { transacoes as mockTransacoes, type Transacao } from './data';
import { fetchTransacoes } from './api';

export interface TransacoesState {
  transacoes: Transacao[];
  loading: boolean;
  error: string | null;
  fromMock: boolean;
}

// Carrega da API; em falha (backend offline), cai para o mock e sinaliza.
export function useTransacoes(): TransacoesState {
  const [state, setState] = useState<TransacoesState>({
    transacoes: [],
    loading: true,
    error: null,
    fromMock: false,
  });

  useEffect(() => {
    const ctrl = new AbortController();
    fetchTransacoes(ctrl.signal)
      .then((transacoes) => setState({ transacoes, loading: false, error: null, fromMock: false }))
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return;
        const message = err instanceof Error ? err.message : 'falha ao carregar transações';
        setState({ transacoes: mockTransacoes, loading: false, error: message, fromMock: true });
      });
    return () => ctrl.abort();
  }, []);

  return state;
}
