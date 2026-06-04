// Dados (mock) do domínio Cartões de crédito (account-service / transaction-service).

export const cartaoResumo = {
  instituicao: 'Nubank',
  apelido: '•••• 3041',
  limiteTotal: 5000.0,
  faturaAtual: 2480.34,
  vencimento: '10/06',
  fechamento: '03/06',
  melhorDiaCompra: '04',
};

// Histórico das últimas faturas (6 meses).
export const faturaHistorico = [
  { mes: 'Dez', valor: 1980 },
  { mes: 'Jan', valor: 2250 },
  { mes: 'Fev', valor: 2120 },
  { mes: 'Mar', valor: 2680 },
  { mes: 'Abr', valor: 2310 },
  { mes: 'Mai', valor: 2480.34 },
];

// Gastos do cartão por categoria (fatura atual; soma = fatura).
export const cartaoPorCategoria = [
  { nome: 'Alimentação', valor: 760.0 },
  { nome: 'Compras', valor: 540.0 },
  { nome: 'Transporte', valor: 410.0 },
  { nome: 'Assinaturas', valor: 380.0 },
  { nome: 'Saúde', valor: 210.0 },
  { nome: 'Lazer', valor: 180.34 },
];

export interface LancamentoCartao {
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
}
export const cartaoLancamentos: LancamentoCartao[] = [
  { data: '30/05', descricao: 'Supermercado Pão de Açúcar', categoria: 'Alimentação', valor: -287.4 },
  { data: '28/05', descricao: 'Posto Shell', categoria: 'Transporte', valor: -210.0 },
  { data: '26/05', descricao: 'Amazon', categoria: 'Compras', valor: -349.9 },
  { data: '24/05', descricao: 'Cinema', categoria: 'Lazer', valor: -64.0 },
  { data: '22/05', descricao: 'Farmácia Drogasil', categoria: 'Saúde', valor: -96.3 },
  { data: '20/05', descricao: 'Spotify', categoria: 'Assinaturas', valor: -21.9 },
];
