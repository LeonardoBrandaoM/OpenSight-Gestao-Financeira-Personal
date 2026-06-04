// Dados (mock) do domínio Overview / analytics consolidado (analytics-service).
import { rng } from '@/shared/lib/mock-helpers';

export interface Kpi {
  label: string;
  valor: number;
  delta: number; // variação % no mês
  tipo: 'patrimonio' | 'receita' | 'despesa' | 'economia';
}

export const kpis: Kpi[] = [
  { label: 'Patrimônio', valor: 48230.71, delta: 3.2, tipo: 'patrimonio' },
  { label: 'Receitas (mês)', valor: 9120.0, delta: 1.4, tipo: 'receita' },
  { label: 'Despesas (mês)', valor: 6480.34, delta: 5.1, tipo: 'despesa' },
  { label: 'Economia (mês)', valor: 2639.66, delta: -8.3, tipo: 'economia' },
];

export const balanceSeries = [
  { mes: 'Jul', saldo: 38120 },
  { mes: 'Ago', saldo: 39540 },
  { mes: 'Set', saldo: 41210 },
  { mes: 'Out', saldo: 40880 },
  { mes: 'Nov', saldo: 43150 },
  { mes: 'Dez', saldo: 44980 },
  { mes: 'Jan', saldo: 45600 },
  { mes: 'Fev', saldo: 46010 },
  { mes: 'Mar', saldo: 47220 },
  { mes: 'Abr', saldo: 46740 },
  { mes: 'Mai', saldo: 48230 },
];

export const cashflow = [
  { mes: 'Dez', receita: 8800, despesa: -6200 },
  { mes: 'Jan', receita: 9000, despesa: -7100 },
  { mes: 'Fev', receita: 8600, despesa: -5900 },
  { mes: 'Mar', receita: 9400, despesa: -6700 },
  { mes: 'Abr', receita: 8900, despesa: -7300 },
  { mes: 'Mai', receita: 9120, despesa: -6480 },
];

export const categorias = [
  { nome: 'Moradia', valor: 2100 },
  { nome: 'Alimentação', valor: 1480 },
  { nome: 'Transporte', valor: 760 },
  { nome: 'Lazer', valor: 640 },
  { nome: 'Saúde', valor: 520 },
  { nome: 'Assinaturas', valor: 380 },
  { nome: 'Outros', valor: 600 },
];

// Status de sincronização / consentimento (consent-service)
export const syncStatus = {
  ultimaSync: 'há 12 min',
  instituicoes: 3,
  consentimentoExpiraEm: 21, // dias
};

// ----- Receitas vs Despesas (rosca, em %) -----
export const receitasDespesas = [
  { nome: 'Receitas', valor: 82.3 },
  { nome: 'Despesas', valor: 17.7 },
];

// ----- Evolução temporal / comparativo mensal (receitas, despesas, saldo) -----
export const evolucaoMensal = [
  { mes: '2025-03', receitas: 16500, despesas: 1800 },
  { mes: '2025-04', receitas: 28000, despesas: 3200 },
  { mes: '2025-05', receitas: 11000, despesas: 4500 },
  { mes: '2025-06', receitas: 22800, despesas: 3100 },
  { mes: '2025-07', receitas: 40000, despesas: 6400 },
  { mes: '2025-08', receitas: 26800, despesas: 3300 },
  { mes: '2025-09', receitas: 11000, despesas: 3200 },
  { mes: '2025-10', receitas: 11400, despesas: 2800 },
  { mes: '2025-11', receitas: 24600, despesas: 4900 },
  { mes: '2025-12', receitas: 26600, despesas: 7600 },
  { mes: '2026-01', receitas: 17600, despesas: 7400 },
  { mes: '2026-02', receitas: 33000, despesas: 6000 },
  { mes: '2026-03', receitas: 5800, despesas: 1100 },
].map((d) => ({ ...d, saldo: d.receitas - d.despesas }));

// ----- Composição do saldo (waterfall) -----
export interface PassoWaterfall {
  nome: string;
  tipo: 'total' | 'saida';
  valor: number;
}
export const waterfall: PassoWaterfall[] = [
  { nome: 'Receita Total', tipo: 'total', valor: 275308 },
  { nome: 'Investimento RF', tipo: 'saida', valor: -20514 },
  { nome: 'Investimento', tipo: 'saida', valor: -15432 },
  { nome: 'Compras', tipo: 'saida', valor: -6156 },
  { nome: 'Educação', tipo: 'saida', valor: -4250 },
  { nome: 'Utilidades', tipo: 'saida', valor: -3871 },
  { nome: 'Saúde', tipo: 'saida', valor: -2227 },
  { nome: 'Alimentação', tipo: 'saida', valor: -2153 },
  { nome: 'Lazer', tipo: 'saida', valor: -2027 },
  { nome: 'Saldo Final', tipo: 'total', valor: 216108 },
];

// ----- Distribuição por método de pagamento (rosca) -----
export const metodoPagamento = [
  { metodo: 'PIX', valor: 48 },
  { metodo: 'TED', valor: 18 },
  { metodo: 'DOC', valor: 16 },
  { metodo: 'BOLETO', valor: 18 },
];

// ----- Fluxo financeiro Tipo → Categoria → Estabelecimento (sankey) -----
export const sankeyData = {
  nodes: [
    { name: 'Débitos' }, // 0
    { name: 'Educação' }, // 1
    { name: 'Compras' }, // 2
    { name: 'Utilidades' }, // 3
    { name: 'Saúde' }, // 4
    { name: 'Entretenimento' }, // 5
    { name: 'Alimentação' }, // 6
    { name: 'Coursera' }, // 7
    { name: 'Udemy' }, // 8
    { name: 'Shopee' }, // 9
    { name: 'Magalu' }, // 10
    { name: 'Sabesp' }, // 11
    { name: 'Claro' }, // 12
    { name: 'Drogasil' }, // 13
    { name: 'Cinemark' }, // 14
    { name: 'Steam' }, // 15
    { name: 'iFood' }, // 16
  ],
  links: [
    { source: 0, target: 1, value: 4250 },
    { source: 0, target: 2, value: 6156 },
    { source: 0, target: 3, value: 3871 },
    { source: 0, target: 4, value: 2227 },
    { source: 0, target: 5, value: 2027 },
    { source: 0, target: 6, value: 2153 },
    { source: 1, target: 7, value: 2600 },
    { source: 1, target: 8, value: 1650 },
    { source: 2, target: 9, value: 3600 },
    { source: 2, target: 10, value: 2556 },
    { source: 3, target: 11, value: 2200 },
    { source: 3, target: 12, value: 1671 },
    { source: 4, target: 13, value: 2227 },
    { source: 5, target: 14, value: 1100 },
    { source: 5, target: 15, value: 927 },
    { source: 6, target: 16, value: 2153 },
  ],
};

// ----- Detecção de anomalias (scatter) -----
export interface PontoAnomalia {
  x: number; // índice de mês (0 = 2025-03)
  valor: number;
  tipo: 'DEBIT' | 'CREDIT';
  anomalia: boolean;
}
export const anomalias: PontoAnomalia[] = (() => {
  const r = rng(101);
  return Array.from({ length: 150 }, () => {
    const x = r() * 13;
    const grande = r() < 0.14;
    const valor = Math.round(grande ? 4000 + r() * 8000 : r() * 2200);
    const tipo: 'DEBIT' | 'CREDIT' = r() < 0.3 ? 'CREDIT' : 'DEBIT';
    return { x, valor, tipo, anomalia: valor > 5500 };
  });
})();

// ----- Horário de pico das transações (heatmap dia × hora) -----
export const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
export const horas = Array.from({ length: 24 }, (_, h) => h);
export const horarioPico: number[][] = (() => {
  const r = rng(53);
  return diasSemana.map(() =>
    horas.map((h) => {
      const ativo = h >= 6 && h <= 21 ? 1 : 0.25;
      return Math.round(r() * ativo * 100);
    }),
  );
})();
