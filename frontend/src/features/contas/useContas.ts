import { useEffect, useState } from 'react';
import { contas as mockContas, type Conta } from './data';
import { fetchContas } from './api';

export interface ContasState {
  contas: Conta[];
  loading: boolean;
  error: string | null; // mensagem quando caímos no fallback
  fromMock: boolean; // true = backend indisponível, usando dados de exemplo
}

// Carrega as contas da API; em falha (ex.: backend offline em dev), cai para o
// mock e sinaliza via `fromMock` — assim a UI continua utilizável sem o backend.
export function useContas(): ContasState {
  const [state, setState] = useState<ContasState>({
    contas: [],
    loading: true,
    error: null,
    fromMock: false,
  });

  useEffect(() => {
    const ctrl = new AbortController();
    fetchContas(ctrl.signal)
      .then((contas) => setState({ contas, loading: false, error: null, fromMock: false }))
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return;
        const message = err instanceof Error ? err.message : 'falha ao carregar contas';
        setState({ contas: mockContas, loading: false, error: message, fromMock: true });
      });
    return () => ctrl.abort();
  }, []);

  return state;
}
