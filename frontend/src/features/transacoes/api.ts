// Integração da feature Transações com o transaction-service.
import { apiGet, services } from '@/shared/api/client';
import type { Transacao } from './data';

interface TransactionDTO {
  id: string;
  accountId: string;
  date: string; // ISO8601
  description: string;
  amountCents: number;
  currency: string;
  category: string;
  type: string;
  status: string;
}
interface TransactionsResponse {
  results: TransactionDTO[];
}

// "2026-05-30" → "30/05"
function fmtDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}` : iso;
}

function toTransacao(t: TransactionDTO): Transacao {
  return {
    data: fmtDate(t.date),
    descricao: t.description,
    categoria: t.category || 'Outros',
    conta: t.accountId, // a API ainda não traz o nome amigável da conta
    valor: t.amountCents / 100,
  };
}

export async function fetchTransacoes(signal?: AbortSignal): Promise<Transacao[]> {
  const data = await apiGet<TransactionsResponse>(services.transactions, '/api/v1/transactions', { signal });
  return data.results.map(toTransacao);
}
