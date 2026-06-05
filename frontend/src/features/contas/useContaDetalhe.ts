import { useEffect, useState } from 'react';
import { useContas } from './useContas';
import { getContaDetalhe, type ContaDetalheData } from './data';
import { fetchTransacoesByAccount } from '@/features/transacoes/api';
import type { Transacao } from '@/features/transacoes/data';

function porCategoriaDe(txs: Transacao[]) {
  const map = new Map<string, number>();
  for (const t of txs) {
    if (t.valor >= 0) continue;
    map.set(t.categoria, (map.get(t.categoria) ?? 0) + Math.abs(t.valor));
  }
  return Array.from(map, ([nome, valor]) => ({ nome, valor: Math.round(valor * 100) / 100 })).sort(
    (a, b) => b.valor - a.valor,
  );
}

export interface ContaDetalheState {
  data: ContaDetalheData | null;
  loading: boolean;
  fromMock: boolean;
}

// Detalhe da conta: conta + transações reais (por accountId). O histórico de
// saldo é sintético (não há endpoint de histórico ainda) e vem do mock. Em
// falha da API, cai inteiro no mock.
export function useContaDetalhe(index: number): ContaDetalheState {
  const { contas, loading: contasLoading, fromMock: contasMock } = useContas();
  const [state, setState] = useState<ContaDetalheState>({ data: null, loading: true, fromMock: false });

  const conta = Number.isInteger(index) ? contas[index] : undefined;
  const accountId = conta?.id;

  useEffect(() => {
    if (contasLoading) return;
    const mock = Number.isInteger(index) ? getContaDetalhe(index) : null;

    if (!conta) {
      setState({ data: null, loading: false, fromMock: contasMock });
      return;
    }
    if (!accountId) {
      setState({ data: mock, loading: false, fromMock: true });
      return;
    }

    const ctrl = new AbortController();
    fetchTransacoesByAccount(accountId, ctrl.signal)
      .then((txs) => {
        const entradas = txs.filter((t) => t.valor > 0).reduce((s, t) => s + t.valor, 0);
        const saidas = txs.filter((t) => t.valor < 0).reduce((s, t) => s + t.valor, 0);
        setState({
          data: {
            conta,
            historico: mock?.historico ?? [],
            transacoes: txs,
            porCategoria: porCategoriaDe(txs),
            entradas,
            saidas,
          },
          loading: false,
          fromMock: contasMock,
        });
      })
      .catch(() => {
        if (ctrl.signal.aborted) return;
        setState({ data: mock, loading: false, fromMock: true });
      });
    return () => ctrl.abort();
  }, [index, contasLoading, contasMock, conta, accountId]);

  return state;
}
