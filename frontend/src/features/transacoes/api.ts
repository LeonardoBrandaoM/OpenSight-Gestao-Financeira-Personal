// Integração da feature Transações com o transaction-service. Resolve também o
// nome amigável da conta consultando o account-service (id → "Instituição apelido").
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

interface AccountDTO {
  id: string;
  institution: string;
  nickname: string;
}
interface AccountsResponse {
  results: AccountDTO[];
}

// "2026-05-30" → "30/05"
function fmtDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}` : iso;
}

// Mapa id→rótulo das contas. Se o account-service cair, segue só com o id.
async function accountLabels(signal?: AbortSignal): Promise<Record<string, string>> {
  try {
    const data = await apiGet<AccountsResponse>(services.accounts, '/api/v1/accounts', { signal });
    const map: Record<string, string> = {};
    for (const a of data.results) map[a.id] = `${a.institution} ${a.nickname}`.trim();
    return map;
  } catch {
    return {};
  }
}

function toTransacao(t: TransactionDTO, labels: Record<string, string>): Transacao {
  return {
    data: fmtDate(t.date),
    descricao: t.description,
    categoria: t.category || 'Outros',
    conta: labels[t.accountId] ?? t.accountId,
    valor: t.amountCents / 100,
  };
}

export async function fetchTransacoes(signal?: AbortSignal): Promise<Transacao[]> {
  const [tx, labels] = await Promise.all([
    apiGet<TransactionsResponse>(services.transactions, '/api/v1/transactions', { signal }),
    accountLabels(signal),
  ]);
  return tx.results.map((t) => toTransacao(t, labels));
}
