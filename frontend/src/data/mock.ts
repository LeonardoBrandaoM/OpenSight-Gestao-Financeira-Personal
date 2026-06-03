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

// ----- Sugestões de orçamento automático (budget-service) -----
// Heurística do MVP: média dos últimos 3 meses por categoria, com folga de 10%
// e arredondamento para a dezena. Categorias com metaAtual = null ainda não
// têm orçamento definido (a sugestão serve para introduzi-las).
export interface SugestaoOrcamento {
  categoria: string;
  media3m: number; // média de gasto dos últimos 3 meses
  metaAtual: number | null; // meta vigente (null = categoria sem orçamento)
  tendencia: number; // variação % do gasto vs. trimestre anterior
}
export const sugestoesOrcamento: SugestaoOrcamento[] = [
  { categoria: 'Alimentação', media3m: 1540, metaAtual: 1600, tendencia: 4.2 },
  { categoria: 'Transporte', media3m: 720, metaAtual: 700, tendencia: 8.1 },
  { categoria: 'Lazer', media3m: 590, metaAtual: 800, tendencia: -6.5 },
  { categoria: 'Assinaturas', media3m: 372, metaAtual: 350, tendencia: 1.2 },
  { categoria: 'Moradia', media3m: 2080, metaAtual: null, tendencia: 0.6 },
  { categoria: 'Saúde', media3m: 455, metaAtual: null, tendencia: -3.4 },
  { categoria: 'Compras', media3m: 600, metaAtual: null, tendencia: 12.7 },
];

// Meta sugerida: média dos 3 meses − 10%, arredondada para a dezena.
export const sugerirMeta = (media3m: number) => Math.round((media3m * 0.9) / 10) * 10;

// Gasto do mês corrente por categoria (fonte única p/ orçamento manual e sugestões).
export const gastoPorCategoria: Record<string, number> = {
  Alimentação: 1480,
  Transporte: 760,
  Lazer: 640,
  Assinaturas: 380,
  Moradia: 2080,
  Saúde: 410,
  Compras: 600,
};

// ----- Tipos de transação: base + personalizados (RF-004) -----
// efeito de fluxo: 'entra' (receita), 'sai' (despesa), 'neutro' (não computa no fluxo).
export type EfeitoFluxo = 'entra' | 'sai' | 'neutro';
export interface TipoTransacao {
  id: string;
  nome: string;
  efeito: EfeitoFluxo;
  base: boolean; // tipos base não podem ser removidos
}
export const tiposTransacao: TipoTransacao[] = [
  { id: 'debito', nome: 'Débito', efeito: 'sai', base: true },
  { id: 'credito', nome: 'Crédito', efeito: 'entra', base: true },
  { id: 'transferencia', nome: 'Transferência', efeito: 'neutro', base: true },
  { id: 'reembolso', nome: 'Reembolso', efeito: 'entra', base: false },
  { id: 'invest-recorrente', nome: 'Investimento recorrente', efeito: 'sai', base: false },
];

// ----- Categorias cadastradas: 12 base + personalizadas (RF-004) -----
export type TipoCategoria = 'receita' | 'despesa' | 'transferencia';
export interface CategoriaCadastro {
  id: string;
  nome: string;
  cor: string;
  tipo: TipoCategoria;
  base: boolean; // categorias base coexistem e não são removidas
  pai?: string | null; // nome da categoria-pai (subcategoria), quando houver
}
export const categoriasCadastro: CategoriaCadastro[] = [
  { id: 'alimentacao', nome: 'Alimentação', cor: '#C1121F', tipo: 'despesa', base: true },
  { id: 'transporte', nome: 'Transporte', cor: '#C8962C', tipo: 'despesa', base: true },
  { id: 'moradia', nome: 'Moradia', cor: '#5A92B0', tipo: 'despesa', base: true },
  { id: 'saude', nome: 'Saúde', cor: '#2FA572', tipo: 'despesa', base: true },
  { id: 'educacao', nome: 'Educação', cor: '#9B6BC9', tipo: 'despesa', base: true },
  { id: 'lazer', nome: 'Lazer', cor: '#E8A317', tipo: 'despesa', base: true },
  { id: 'compras', nome: 'Compras', cor: '#6B7280', tipo: 'despesa', base: true },
  { id: 'servicos', nome: 'Serviços', cor: '#D9737B', tipo: 'despesa', base: true },
  { id: 'investimentos', nome: 'Investimentos', cor: '#1E5C44', tipo: 'despesa', base: true },
  { id: 'receitas', nome: 'Receitas', cor: '#2FA572', tipo: 'receita', base: true },
  { id: 'transferencias', nome: 'Transferências', cor: '#4B515C', tipo: 'transferencia', base: true },
  { id: 'outros', nome: 'Outros', cor: '#8C929C', tipo: 'despesa', base: true },
  // Exemplos personalizados pré-existentes
  { id: 'assinaturas', nome: 'Assinaturas', cor: '#F03A24', tipo: 'despesa', base: false, pai: 'Lazer' },
  { id: 'pets', nome: 'Pets', cor: '#E8B23E', tipo: 'despesa', base: false },
];

// Paleta sugerida para o seletor de cor ao criar categorias.
export const paletaCategoria = [
  '#C1121F', '#F03A24', '#C8962C', '#E8A317', '#2FA572', '#5A92B0', '#9B6BC9', '#D9737B', '#6B7280', '#8C929C',
];

// `ajustado` = projeção realista refinada pela trajetória mediana de pares
// bem-sucedidos da mesma faixa de renda (RF-008 híbrido). Só é exibida quando
// o consentimento de benchmarking está ativo.
export const projecao = [
  { mes: 'Jun', otimista: 49600, realista: 49100, pessimista: 48400, ajustado: 49350 },
  { mes: 'Jul', otimista: 51200, realista: 50100, pessimista: 48700, ajustado: 50650 },
  { mes: 'Ago', otimista: 52900, realista: 51000, pessimista: 48900, ajustado: 51950 },
  { mes: 'Set', otimista: 54700, realista: 52050, pessimista: 49100, ajustado: 53350 },
  { mes: 'Out', otimista: 56600, realista: 53200, pessimista: 49400, ajustado: 54900 },
  { mes: 'Nov', otimista: 58600, realista: 54300, pessimista: 49600, ajustado: 56450 },
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
  // Cartão de crédito
  limiteTotal?: number;
  faturaAtual?: number;
  vencimento?: string; // dd/mm
  fechamento?: string; // dd/mm
  // Investimentos: composição da carteira por classe (soma = saldo)
  alocacao?: { classe: string; valor: number }[];
}
export const contas: Conta[] = [
  { instituicao: 'Itaú', tipo: 'Conta corrente', apelido: '•••• 4471', saldo: 15400.0, delta: 0.8 },
  { instituicao: 'Nubank', tipo: 'Conta corrente', apelido: '•••• 8820', saldo: 8230.71, delta: 2.1 },
  { instituicao: 'Inter', tipo: 'Conta corrente', apelido: '•••• 1190', saldo: 4600.0, delta: -1.2 },
  {
    instituicao: 'XP',
    tipo: 'Investimentos',
    apelido: 'Carteira',
    saldo: 22480.34,
    delta: 3.6,
    alocacao: [
      { classe: 'Renda fixa', valor: 11200.0 },
      { classe: 'Ações', valor: 6480.34 },
      { classe: 'FIIs', valor: 3200.0 },
      { classe: 'Cripto', valor: 1600.0 },
    ],
  },
  {
    instituicao: 'Nubank',
    tipo: 'Cartão de crédito',
    apelido: '•••• 3041',
    saldo: -2480.34,
    delta: 5.1,
    limiteTotal: 5000.0,
    faturaAtual: 2480.34,
    vencimento: '10/06',
    fechamento: '03/06',
  },
];

// ===== Detalhamento de uma conta (overview individual) =====
// Deriva um histórico de saldo, uma carteira de transações e a quebra por
// categoria de forma determinística a partir da conta (mock até o backend existir).
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 2147483647;
  return h || 1;
}

const detalheMeses = ['Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'];

const poolDespesas = [
  { descricao: 'Supermercado Pão de Açúcar', categoria: 'Alimentação' },
  { descricao: 'Posto Shell', categoria: 'Transporte' },
  { descricao: 'Farmácia Drogasil', categoria: 'Saúde' },
  { descricao: 'Restaurante', categoria: 'Alimentação' },
  { descricao: 'Spotify', categoria: 'Assinaturas' },
  { descricao: 'Loja online', categoria: 'Compras' },
  { descricao: 'Conta de energia', categoria: 'Utilidades' },
  { descricao: 'Uber', categoria: 'Transporte' },
  { descricao: 'Cinema', categoria: 'Lazer' },
];
const poolReceitas = [
  { descricao: 'Salário', categoria: 'Receita' },
  { descricao: 'Transferência recebida', categoria: 'Transferência' },
  { descricao: 'Reembolso amigo', categoria: 'Transferência' },
];
const poolInvest = [
  { descricao: 'Aporte CDB', categoria: 'Investimento' },
  { descricao: 'Rendimento da carteira', categoria: 'Receita' },
  { descricao: 'Compra de ações', categoria: 'Investimento' },
  { descricao: 'Dividendos', categoria: 'Receita' },
];

export interface ContaDetalheData {
  conta: Conta;
  historico: { mes: string; saldo: number }[];
  transacoes: Transacao[];
  porCategoria: { nome: string; valor: number }[];
  entradas: number;
  saidas: number;
}

export function getContaDetalhe(index: number): ContaDetalheData | null {
  const conta = contas[index];
  if (!conta) return null;

  const r = rng(hashStr(conta.instituicao + conta.apelido + conta.tipo));
  const cartao = conta.tipo === 'Cartão de crédito';
  const investimento = conta.tipo === 'Investimentos';

  // Histórico de saldo: 7 meses terminando no saldo atual, com passos suaves.
  const passos = detalheMeses.map(() => (r() - 0.45) * Math.max(Math.abs(conta.saldo) * 0.06, 300));
  let acc = conta.saldo;
  const historicoRev: { mes: string; saldo: number }[] = [];
  for (let i = detalheMeses.length - 1; i >= 0; i--) {
    historicoRev.push({ mes: detalheMeses[i], saldo: Math.round(acc * 100) / 100 });
    acc -= passos[i];
  }
  const historico = historicoRev.reverse();

  // Transações do mês corrente para a conta.
  const pool = investimento ? poolInvest : cartao ? poolDespesas : [...poolDespesas, ...poolReceitas];
  const n = 6 + Math.floor(r() * 5);
  const dias = new Set<number>();
  const transacoes: Transacao[] = [];
  for (let i = 0; i < n; i++) {
    const item = pool[Math.floor(r() * pool.length)];
    const receita = item.categoria === 'Receita' || item.categoria === 'Transferência';
    const base = receita ? 400 + r() * 4000 : 20 + r() * 480;
    const valor = (receita ? 1 : -1) * Math.round(base * 100) / 100;
    let dia = 1 + Math.floor(r() * 30);
    while (dias.has(dia)) dia = 1 + ((dia + 3) % 30);
    dias.add(dia);
    transacoes.push({
      data: `${String(dia).padStart(2, '0')}/05`,
      descricao: item.descricao,
      categoria: item.categoria,
      conta: `${conta.instituicao} ${conta.apelido}`,
      valor,
    });
  }
  transacoes.sort((a, b) => Number(b.data.slice(0, 2)) - Number(a.data.slice(0, 2)));

  const entradas = transacoes.filter((t) => t.valor > 0).reduce((s, t) => s + t.valor, 0);
  const saidas = transacoes.filter((t) => t.valor < 0).reduce((s, t) => s + t.valor, 0);

  const catMap = new Map<string, number>();
  for (const t of transacoes) {
    if (t.valor >= 0) continue;
    catMap.set(t.categoria, (catMap.get(t.categoria) ?? 0) + Math.abs(t.valor));
  }
  const porCategoria = Array.from(catMap, ([nome, valor]) => ({ nome, valor: Math.round(valor * 100) / 100 })).sort(
    (a, b) => b.valor - a.valor,
  );

  return { conta, historico, transacoes, porCategoria, entradas, saidas };
}

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

// ============================================================================
// Benchmarking por classes / coorte de pares (RF-012, RNF-013, RN-008..010)
// Dados agregados e anonimizados — nunca representam um usuário individual.
// ============================================================================

export interface ComparativoCohort {
  metrica: string;
  voce: number;
  mediana: number; // mediana dos pares bem-sucedidos da mesma faixa
  unidade: string;
  maiorMelhor: boolean; // se valor maior é melhor (poupança) ou pior (gasto)
}
export interface DriverCohort {
  tipo: 'sucesso' | 'fracasso';
  texto: string;
}
export const cohort = {
  faixaRenda: '5–10 salários mínimos',
  membros: 1284, // pares consentidos na coorte
  kMinimo: 30, // k-anonimato (RN-010): coorte só aparece acima deste limiar
  trajetoria: 'melhorou' as 'melhorou' | 'estavel' | 'decaiu',
  taxaCumprimentoVoce: 75, // % de metas cumpridas (RN-009)
  taxaCumprimentoMediana: 61,
  comparativos: [
    { metrica: 'Taxa de poupança', voce: 22, mediana: 17, unidade: '% da renda', maiorMelhor: true },
    { metrica: 'Metas cumpridas', voce: 75, mediana: 61, unidade: '%', maiorMelhor: true },
    { metrica: 'Gasto em Moradia', voce: 31, mediana: 34, unidade: '% da renda', maiorMelhor: false },
    { metrica: 'Gasto em Lazer', voce: 8, mediana: 11, unidade: '% da renda', maiorMelhor: false },
    { metrica: 'Gasto em Assinaturas', voce: 4.1, mediana: 2.6, unidade: '% da renda', maiorMelhor: false },
  ] as ComparativoCohort[],
  drivers: [
    { tipo: 'sucesso', texto: 'Pares que melhoraram mantêm Moradia abaixo de 30% da renda.' },
    { tipo: 'sucesso', texto: 'Aporte automático em investimentos no início do mês, antes dos gastos.' },
    { tipo: 'fracasso', texto: 'Gasto recorrente em Assinaturas acima da mediana derruba a poupança.' },
    { tipo: 'fracasso', texto: 'Metas de Lazer raramente revisadas acompanham quem decaiu de faixa.' },
  ] as DriverCohort[],
  recomendacoes: [
    'Reduza Assinaturas em ~R$ 60/mês para se alinhar à mediana de poupança da sua faixa.',
    'Defina meta de Lazer em ~9% da renda, padrão dos pares que melhoraram.',
    'Agende um aporte automático no início do mês, como 68% dos bem-sucedidos.',
  ],
};

// ============================================================================
// Investimentos — página dedicada (investment-service)
// ============================================================================
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

// ============================================================================
// Cartões de crédito — página dedicada (card-service)
// ============================================================================
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
