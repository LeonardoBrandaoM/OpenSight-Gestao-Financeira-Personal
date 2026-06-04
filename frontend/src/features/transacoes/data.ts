// Dados (mock) do domínio Transações (transaction-service).

export interface Transacao {
  data: string;
  descricao: string;
  categoria: string;
  conta: string;
  valor: number;
}
export const transacoes: Transacao[] = [
  { data: '30/05', descricao: 'Supermercado Pão de Açúcar', categoria: 'Alimentação', conta: 'Nubank', valor: -287.4 },
  { data: '29/05', descricao: 'Salário', categoria: 'Receita', conta: 'Itaú', valor: 9120.0 },
  { data: '28/05', descricao: 'Posto Shell', categoria: 'Transporte', conta: 'Nubank', valor: -210.0 },
  { data: '27/05', descricao: 'Spotify', categoria: 'Assinaturas', conta: 'Inter', valor: -21.9 },
  { data: '26/05', descricao: 'Farmácia Drogasil', categoria: 'Saúde', conta: 'Nubank', valor: -96.3 },
  { data: '25/05', descricao: 'Reembolso amigo', categoria: 'Transferência', conta: 'Itaú', valor: 150.0 },
  { data: '24/05', descricao: 'Cinema', categoria: 'Lazer', conta: 'Inter', valor: -64.0 },
];
