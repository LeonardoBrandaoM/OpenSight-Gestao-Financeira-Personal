// Dados (mock) do domínio Privacidade / Consentimento (consent-service / privacy-service).

export interface Consentimento {
  instituicao: string;
  escopos: string[];
  status: 'ativo' | 'expirando' | 'revogado';
  expiraEm: number; // dias
  concedidoEm: string;
}
export const consentimentos: Consentimento[] = [
  { instituicao: 'Itaú', escopos: ['ACCOUNTS_READ', 'TRANSACTIONS_READ'], status: 'ativo', expiraEm: 68, concedidoEm: '24/03/2026' },
  { instituicao: 'Nubank', escopos: ['ACCOUNTS_READ', 'TRANSACTIONS_READ', 'IDENTITY_READ'], status: 'ativo', expiraEm: 54, concedidoEm: '10/03/2026' },
  { instituicao: 'Inter', escopos: ['ACCOUNTS_READ', 'TRANSACTIONS_READ'], status: 'expirando', expiraEm: 21, concedidoEm: '08/02/2026' },
  { instituicao: 'XP', escopos: ['ACCOUNTS_READ'], status: 'ativo', expiraEm: 79, concedidoEm: '01/04/2026' },
];
