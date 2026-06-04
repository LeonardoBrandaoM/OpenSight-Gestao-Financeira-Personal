// Fonte única de verdade da navegação — usada pela Sidebar, pelo Topbar e pelas rotas.
export interface NavItem {
  path: string;
  label: string;
  title: string;
  subtitle: string;
}

export const navItems: NavItem[] = [
  { path: '/', label: 'Visão Geral', title: 'Visão Geral', subtitle: 'Panorama consolidado das suas contas e gastos' },
  { path: '/contas', label: 'Contas', title: 'Contas', subtitle: 'Saldos consolidados por instituição' },
  { path: '/cartoes', label: 'Cartões', title: 'Cartões de crédito', subtitle: 'Faturas, limite e gastos do cartão' },
  { path: '/investimentos', label: 'Investimentos', title: 'Investimentos', subtitle: 'Carteira, rentabilidade e posições' },
  { path: '/transacoes', label: 'Transações', title: 'Transações', subtitle: 'Histórico, busca e filtros' },
  { path: '/categorias', label: 'Categorias', title: 'Categorias', subtitle: 'Para onde vai o seu dinheiro' },
  { path: '/orcamento', label: 'Orçamento', title: 'Orçamento', subtitle: 'Metas flexíveis e progresso' },
  { path: '/projecoes', label: 'Projeções', title: 'Projeções', subtitle: 'Cenários de patrimônio futuro' },
  { path: '/benchmarking', label: 'Benchmarking', title: 'Benchmarking', subtitle: 'Comparação anonimizada com pares da sua faixa' },
  { path: '/alertas', label: 'Alertas', title: 'Alertas', subtitle: 'Anomalias, metas e consentimentos' },
  { path: '/privacidade', label: 'Gestão do Consentimento', title: 'Gestão do Consentimento', subtitle: 'Consentimentos Open Finance e direitos LGPD' },
];
