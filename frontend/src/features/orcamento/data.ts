// Dados (mock) do domínio Orçamento (budget-service).

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

// ----- % Comprometimento de receita (gauge) -----
export const comprometimento = {
  pct: 21.5,
  comprometido: 59200.3,
  receitas: 275307.86,
  saldoLiquido: 216107.56,
  status: 'Saudável' as const,
};
