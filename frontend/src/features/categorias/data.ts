// Dados (mock) do domínio Categorias (categorization-service).
import { rng, meses } from '@/shared/lib/mock-helpers';

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
