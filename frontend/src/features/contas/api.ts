// Integração da feature Contas com o account-service (GET /api/v1/accounts).
// Mapeia o DTO da API (modelo canônico, centavos) para o `Conta` da UI.
import { apiGet, services } from '@/shared/api/client';
import type { Conta } from './data';

interface AccountDTO {
  id: string;
  institution: string;
  type: string; // CHECKING | SAVINGS | CREDIT_CARD | INVESTMENT
  nickname: string;
  balanceCents: number;
  currency: string;
  updatedAt: string;
}
interface AccountsResponse {
  results: AccountDTO[];
}

const tipoMap: Record<string, Conta['tipo']> = {
  CHECKING: 'Conta corrente',
  SAVINGS: 'Poupança',
  CREDIT_CARD: 'Cartão de crédito',
  INVESTMENT: 'Investimentos',
};

function toConta(a: AccountDTO): Conta {
  return {
    id: a.id,
    instituicao: a.institution,
    tipo: tipoMap[a.type] ?? 'Conta corrente',
    apelido: a.nickname,
    saldo: a.balanceCents / 100, // API usa centavos; UI usa reais
    delta: 0, // a API ainda não expõe variação no mês
  };
}

export async function fetchContas(signal?: AbortSignal): Promise<Conta[]> {
  const data = await apiGet<AccountsResponse>(services.accounts, '/api/v1/accounts', { signal });
  return data.results.map(toConta);
}

export interface PontoSaldo {
  mes: string;
  saldo: number;
}
interface BalanceHistoryResponse {
  results: PontoSaldo[];
}

// Histórico de saldo de uma conta (GET /api/v1/accounts/{id}/balance-history).
export async function fetchBalanceHistory(accountId: string, signal?: AbortSignal): Promise<PontoSaldo[]> {
  const data = await apiGet<BalanceHistoryResponse>(
    services.accounts,
    `/api/v1/accounts/${encodeURIComponent(accountId)}/balance-history`,
    { signal },
  );
  return data.results;
}
