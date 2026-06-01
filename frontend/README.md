# OpenSight — Frontend (starter)

Dashboard do OpenSight no sistema visual **"Warmind Carmesim"**.
Starter de **React + Vite + TypeScript + Tailwind + Tremor + Recharts**, com dados fictícios — pronto para plugar nos serviços de backend depois.

## Stack

| Camada | Escolha | Por quê |
|--------|---------|---------|
| Build | **Vite** | Dev server rápido, HMR |
| UI | **React 18 + TS** | Caminho de produção da arquitetura |
| Estilo | **Tailwind CSS** | Tokens Warmind como classes (`bg-void`, `text-bone`, …) |
| Componentes | **Tremor** | `Card`, `ProgressBar` — scaffolding de dashboard dark-mode |
| Gráficos | **Recharts** | Cores **exatas** da paleta (Tremor limita cor a nomes Tailwind) |

> **Decisão de design:** o Tremor cuida da casca (cards, progresso). Os gráficos usam Recharts direto, com os HEX de `src/theme/tokens.ts`, para respeitar a *Regra do Duplo Vermelho* (`gain`/`loss` ≠ carmesim-marca). Veja `../Branding/`.

## Rodar

```bash
cd frontend
npm install
npm run dev      # abre em http://localhost:5173
```

Build de produção:

```bash
npm run build && npm run preview
```

## Estrutura

```
src/
  nav.ts                   fonte única de navegação (paths + títulos), usada por Sidebar/Topbar/rotas
  theme/tokens.ts          paleta + formatadores BR (brl, pct) + estilo de eixo
  data/mock.ts             dados fictícios (trocar por API dos serviços)
  components/
    Layout.tsx             sidebar + topbar + <Outlet/> das rotas
    ui.tsx                 Panel, StatCard, DeltaChip
    charts.tsx             BalanceArea, CashflowBars, CategoryBar, CategoryDonut, ProjectionLines
    Sidebar.tsx            navegação (NavLink) + marca (harpia) + selo READ-ONLY
    Topbar.tsx             título dinâmico por rota + status de sync + consentimento
    BudgetList.tsx         barras de orçamento (Tremor ProgressBar)
    TransactionsTable.tsx  tabela de transações (mono tabular, aceita data por prop)
  pages/                   Overview, Contas, Transacoes, Categorias, Orcamento, Projecoes, Alertas, Privacidade
  App.tsx                  React Router (BrowserRouter + rotas)
public/brand/              assets da marca copiados de ../Branding/Assets
```

## Telas (todas navegáveis)

| Rota | Tela | Destaques |
|------|------|-----------|
| `/` | Visão Geral | KPIs + 5 gráficos + orçamento + transações |
| `/contas` | Contas | cards por instituição, saldo (cartão em vermelho), Δ no mês |
| `/transacoes` | Transações | busca + filtro por categoria + resumo entradas/saídas |
| `/categorias` | Categorias | donut + barra + tabela com % do total |
| `/orcamento` | Orçamento | resumo + barras de progresso (50/80/100%) |
| `/projecoes` | Projeções | cards de cenário + gráfico de 3 cenários |
| `/alertas` | Alertas | cards por severidade (crítico/atenção/info) |
| `/privacidade` | Privacidade | banner READ-ONLY + consentimentos + direitos LGPD |

## Mapa para o backend

Cada bloco de `mock.ts` corresponde a um serviço da `Documentação/ArquiteturaOpenSight.md`:

| Dado mock | Serviço de origem |
|-----------|-------------------|
| `kpis`, `balanceSeries`, `categorias`, `cashflow` | analytics-service |
| `transacoes` | transaction-service |
| `budgets` | budget-service |
| `projecao` | projection-service |
| `syncStatus` | consent-service / connector-service |

## Próximos passos sugeridos

- Camada de dados (TanStack Query) consumindo o API Gateway — trocar `data/mock.ts` por chamadas reais.
- Estados de carregamento/erro (skeletons no clima aço) por painel.
- Autenticação + 2FA (auth-service) e guarda de rotas.
- Tema claro opcional (acessibilidade) — a identidade-mãe é escura.
- Converter o wordmark do lockup em paths para uso sem a fonte instalada.
