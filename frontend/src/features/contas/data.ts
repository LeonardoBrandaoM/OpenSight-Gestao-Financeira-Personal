// Dados (mock) do domínio Contas (account-service).
import { rng } from '@/shared/lib/mock-helpers';
import type { Transacao } from '@/features/transacoes/data';

export interface Conta {
  id?: string; // id da conta no backend (account-service)
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
  { id: 'acc-itau-4471', instituicao: 'Itaú', tipo: 'Conta corrente', apelido: '•••• 4471', saldo: 15400.0, delta: 0.8 },
  { id: 'acc-nubank-8820', instituicao: 'Nubank', tipo: 'Conta corrente', apelido: '•••• 8820', saldo: 8230.71, delta: 2.1 },
  { id: 'acc-inter-1190', instituicao: 'Inter', tipo: 'Conta corrente', apelido: '•••• 1190', saldo: 4600.0, delta: -1.2 },
  {
    id: 'acc-xp-carteira',
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
    id: 'acc-nubank-3041',
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
