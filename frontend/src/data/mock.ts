// Dados fictícios para o starter. Substituir por chamadas aos serviços
// (account, transaction, analytics, budget, projection) quando o backend existir.

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

export interface Budget {
  categoria: string;
  gasto: number;
  meta: number;
}
export const budgets: Budget[] = [
  { categoria: 'Alimentação', gasto: 1480, meta: 1600 },
  { categoria: 'Transporte', gasto: 760, meta: 700 },
  { categoria: 'Lazer', gasto: 640, meta: 800 },
  { categoria: 'Assinaturas', gasto: 380, meta: 350 },
];

export const projecao = [
  { mes: 'Jun', otimista: 49600, realista: 49100, pessimista: 48400 },
  { mes: 'Jul', otimista: 51200, realista: 50100, pessimista: 48700 },
  { mes: 'Ago', otimista: 52900, realista: 51000, pessimista: 48900 },
  { mes: 'Set', otimista: 54700, realista: 52050, pessimista: 49100 },
  { mes: 'Out', otimista: 56600, realista: 53200, pessimista: 49400 },
  { mes: 'Nov', otimista: 58600, realista: 54300, pessimista: 49600 },
];

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

// Status de sincronização / consentimento (consent-service)
export const syncStatus = {
  ultimaSync: 'há 12 min',
  instituicoes: 3,
  consentimentoExpiraEm: 21, // dias
};

// ===== Contas (account-service) =====
export interface Conta {
  instituicao: string;
  tipo: 'Conta corrente' | 'Cartão de crédito' | 'Investimentos' | 'Poupança';
  apelido: string;
  saldo: number;
  delta: number;
}
export const contas: Conta[] = [
  { instituicao: 'Itaú', tipo: 'Conta corrente', apelido: '•••• 4471', saldo: 15400.0, delta: 0.8 },
  { instituicao: 'Nubank', tipo: 'Conta corrente', apelido: '•••• 8820', saldo: 8230.71, delta: 2.1 },
  { instituicao: 'Inter', tipo: 'Conta corrente', apelido: '•••• 1190', saldo: 4600.0, delta: -1.2 },
  { instituicao: 'XP', tipo: 'Investimentos', apelido: 'Carteira', saldo: 22480.34, delta: 3.6 },
  { instituicao: 'Nubank', tipo: 'Cartão de crédito', apelido: '•••• 3041', saldo: -2480.34, delta: 5.1 },
];

// ===== Alertas (analytics-service / budget-service / consent-service) =====
export interface Alerta {
  severidade: 'critico' | 'atencao' | 'info';
  tipo: string;
  titulo: string;
  detalhe: string;
  quando: string;
}
export const alertas: Alerta[] = [
  { severidade: 'critico', tipo: 'Anomalia', titulo: 'Gasto fora do padrão', detalhe: 'R$ 480,00 em Eletrônicos — 2,3× acima da sua média.', quando: 'há 2 dias' },
  { severidade: 'critico', tipo: 'Orçamento', titulo: 'Transporte estourou a meta', detalhe: 'R$ 760,00 de R$ 700,00 (109%).', quando: 'há 3 dias' },
  { severidade: 'atencao', tipo: 'Orçamento', titulo: 'Alimentação em 93% da meta', detalhe: 'R$ 1.480,00 de R$ 1.600,00.', quando: 'há 1 dia' },
  { severidade: 'atencao', tipo: 'Consentimento', titulo: 'Consentimento expirando', detalhe: 'Banco Inter expira em 21 dias. Renove para manter a visão ativa.', quando: 'há 5 h' },
  { severidade: 'info', tipo: 'Recorrência', titulo: 'Nova assinatura detectada', detalhe: 'Cobrança recorrente de R$ 21,90 (Spotify) identificada.', quando: 'há 1 semana' },
];

// ===== Consentimentos (consent-service) =====
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

// ============================================================================
// Dados para os gráficos avançados (reproduzidos das referências em /graphrefs)
// ============================================================================

// PRNG determinístico (para gerar nuvens de pontos/heatmaps estáveis)
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const meses = [
  '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09',
  '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03',
];

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

// ----- Treemap por categoria -----
export const treemapCategorias = [
  { nome: 'Investimento RF', valor: 20514 },
  { nome: 'Investimento', valor: 15432 },
  { nome: 'Compras', valor: 6156 },
  { nome: 'Educação', valor: 4250 },
  { nome: 'Utilidades', valor: 3871 },
  { nome: 'Saúde', valor: 2227 },
  { nome: 'Alimentação', valor: 2153 },
  { nome: 'Lazer', valor: 2027 },
  { nome: 'Transporte', valor: 1161 },
];

// ----- Hierarquia de gastos (sunburst via 2 anéis; somas por grupo batem) -----
export const hierarquiaInterna = [
  { nome: 'Crédito', valor: 82 },
  { nome: 'Débito', valor: 18 },
];
export const hierarquiaExterna = [
  { nome: 'Salário', grupo: 'Crédito', valor: 61 },
  { nome: 'Investimento', grupo: 'Crédito', valor: 14 },
  { nome: 'Transferência', grupo: 'Crédito', valor: 7 },
  { nome: 'Compras', grupo: 'Débito', valor: 8 },
  { nome: 'Margem', grupo: 'Débito', valor: 5 },
  { nome: 'Inv. RF', grupo: 'Débito', valor: 5 },
];

// ----- Heatmap categoria × mês -----
export const heatCategorias = [
  'Inv. RF', 'Investimento', 'Compras', 'Educação', 'Utilidades', 'Saúde', 'Alimentação', 'Lazer', 'Transporte', 'Streaming',
];
export const heatmapCatMes: number[][] = (() => {
  const r = rng(7);
  return heatCategorias.map((_, row) =>
    meses.map(() => {
      const burst = r() < 0.12 ? 1 : 0;
      return Math.round((r() * 0.5 + burst * (0.5 + r() * 0.5) + row * 0.02) * 9000);
    }),
  );
})();

// ----- Frequência × volume × ticket médio (bolhas) -----
export const bolhasCategorias = [
  { categoria: 'Inv. RF', transacoes: 28, volume: 20500, ticket: 732 },
  { categoria: 'Investimento', transacoes: 27, volume: 15400, ticket: 571 },
  { categoria: 'Compras', transacoes: 18, volume: 6156, ticket: 342 },
  { categoria: 'Alimentação', transacoes: 25, volume: 4600, ticket: 184 },
  { categoria: 'Utilidades', transacoes: 23, volume: 3870, ticket: 168 },
  { categoria: 'Saúde', transacoes: 23, volume: 2227, ticket: 97 },
  { categoria: 'Lazer', transacoes: 26, volume: 1400, ticket: 54 },
  { categoria: 'Streaming', transacoes: 28, volume: 1800, ticket: 64 },
];

// ----- Gastos por dia da semana (radar) -----
export const radarDiaSemana = [
  { dia: 'Seg', valor: 520 },
  { dia: 'Ter', valor: 340 },
  { dia: 'Qua', valor: 610 },
  { dia: 'Qui', valor: 430 },
  { dia: 'Sex', valor: 380 },
  { dia: 'Sáb', valor: 290 },
  { dia: 'Dom', valor: 560 },
];

// ----- Evolução da média mensal por categoria (multi-linha) -----
export const seriesMediaMensal = ['Compras', 'Educação', 'Utilidades', 'Saúde', 'Lazer', 'Entretenimento'];
export const mediaMensalCategorias = (() => {
  const r = rng(19);
  return meses.map((mes) => {
    const ponto: Record<string, number | string> = { mes };
    for (const s of seriesMediaMensal) ponto[s] = Math.round(r() * 480 + 20);
    return ponto;
  });
})();

// ----- Distribuição estatística por categoria (box plot) -----
export interface BoxCat {
  categoria: string;
  min: number;
  q1: number;
  mediana: number;
  q3: number;
  max: number;
  outliers: number[];
}
export const boxplotCategorias: BoxCat[] = [
  { categoria: 'Alimentação', min: 8, q1: 32, mediana: 48, q3: 64, max: 120, outliers: [300, 660] },
  { categoria: 'Compras', min: 50, q1: 180, mediana: 270, q3: 480, max: 920, outliers: [] },
  { categoria: 'Utilidades', min: 60, q1: 120, mediana: 160, q3: 210, max: 280, outliers: [440] },
  { categoria: 'Streaming', min: 20, q1: 40, mediana: 55, q3: 70, max: 95, outliers: [] },
  { categoria: 'Entretenimento', min: 18, q1: 45, mediana: 70, q3: 110, max: 160, outliers: [] },
  { categoria: 'Saúde', min: 15, q1: 50, mediana: 75, q3: 130, max: 200, outliers: [540] },
  { categoria: 'Educação', min: 40, q1: 110, mediana: 160, q3: 240, max: 360, outliers: [] },
  { categoria: 'Transporte', min: 10, q1: 28, mediana: 45, q3: 70, max: 110, outliers: [] },
];

// ----- % Comprometimento de receita (gauge) -----
export const comprometimento = {
  pct: 21.5,
  comprometido: 59200.3,
  receitas: 275307.86,
  saldoLiquido: 216107.56,
  status: 'Saudável' as const,
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
