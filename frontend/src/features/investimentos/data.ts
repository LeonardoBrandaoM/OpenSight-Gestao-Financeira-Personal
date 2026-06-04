// Dados (mock) do domínio Investimentos (investment-service / account-service).

export const investResumo = {
  total: 22480.34,
  rendimentoMes: 3.6, // % no mês
  rentabilidade12m: 11.8, // % nos últimos 12 meses
  aporteMes: 800.0,
};

// Composição da carteira por classe (soma = total).
export const carteiraAlocacao = [
  { classe: 'Renda fixa', valor: 11200.0 },
  { classe: 'Ações', valor: 6480.34 },
  { classe: 'FIIs', valor: 3200.0 },
  { classe: 'Cripto', valor: 1600.0 },
];

// Evolução do valor da carteira (8 meses).
export const carteiraEvolucao = [
  { mes: 'Nov', valor: 18900 },
  { mes: 'Dez', valor: 19600 },
  { mes: 'Jan', valor: 20100 },
  { mes: 'Fev', valor: 20800 },
  { mes: 'Mar', valor: 21200 },
  { mes: 'Abr', valor: 21650 },
  { mes: 'Mai', valor: 22050 },
  { mes: 'Jun', valor: 22480.34 },
];

// Rentabilidade por classe no mês (%).
export const rendimentoPorClasse = [
  { classe: 'Cripto', rendimento: 12.4 },
  { classe: 'Ações', rendimento: 5.2 },
  { classe: 'FIIs', rendimento: 2.1 },
  { classe: 'Renda fixa', rendimento: 0.9 },
];

export interface PosicaoInvest {
  ativo: string;
  classe: string;
  valor: number;
  rendimento: number; // % no mês
}
export const posicoes: PosicaoInvest[] = [
  { ativo: 'Tesouro Selic 2029', classe: 'Renda fixa', valor: 7000.0, rendimento: 0.8 },
  { ativo: 'CDB Banco X 110% CDI', classe: 'Renda fixa', valor: 4200.0, rendimento: 1.0 },
  { ativo: 'PETR4', classe: 'Ações', valor: 2600.0, rendimento: 6.1 },
  { ativo: 'VALE3', classe: 'Ações', valor: 1980.34, rendimento: 5.9 },
  { ativo: 'ITUB4', classe: 'Ações', valor: 1900.0, rendimento: 3.4 },
  { ativo: 'HGLG11', classe: 'FIIs', valor: 3200.0, rendimento: 2.1 },
  { ativo: 'Bitcoin', classe: 'Cripto', valor: 1600.0, rendimento: 12.4 },
];
