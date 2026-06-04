# Estrutura de Projeto e Convenções — OpenSight

**Versão:** 0.1.0
**Data:** 02/06/2026
**Status:** Proposta (alvo) — guia de referência
**Referências:** `ArquiteturaOpenSight.md`, `SRSGestorFinanceiro(0.0.005).MD`, `CLAUDE.md`, `Branding/PaletaDeCores.md`

> **Ver também:** [Arquitetura](ArquiteturaOpenSight.md) · [Diagramas](DiagramaArquitetural.md) · [SRS](<SRSGestorFinanceiro(0.0.005).MD>) · [SDK/GetApiKey](SDK/GetApiKey.md). Conector READ-ONLY já implementado em `services/institution-connector-service/`.

> Este documento define a **estrutura de pastas/arquivos alvo** do repositório e as **convenções de código**. É um guia de referência: descreve para onde o projeto deve evoluir e em que ordem migrar. **Nada precisa ser movido para que o código atual funcione** — a migração é incremental (ver §6). O idioma de trabalho continua **pt-BR**.

---

## 1. Princípios

1. **Feature-based ("screaming architecture"):** a árvore de pastas deve gritar o **domínio** (contas, orçamento, investimentos…), não o framework. Ao abrir `src/features/`, deve ficar óbvio o que o produto faz.
2. **Espelhar os limites dos microsserviços:** cada feature do frontend mapeia para um (ou poucos) serviços da `ArquiteturaOpenSight.md`. Isso facilita plugar o backend depois e mantém as fronteiras de domínio coerentes ponta a ponta.
3. **Direção de dependência para dentro:** `features/*` podem depender de `shared/*`; **`shared/*` nunca importa de `features/*`**; uma feature **não** importa arquivos internos de outra (só via o barrel público `features/<x>/index.ts`). Isso evita acoplamento cruzado e ciclos.
4. **Co-locação:** o que muda junto fica junto. A página, seus componentes, seus gráficos específicos, seus dados (mock) e seus tipos vivem dentro da feature.
5. **Invariantes preservadas:** o backend mantém **READ-ONLY** (arquitetura §4.4) e o design **provider-agnostic** (RNF-012); o frontend mantém as regras de marca/tema (§5).
6. **Fonte única de verdade:** navegação em um lugar (`nav.ts`), cores/tema em `theme/tokens.ts` (espelhando `Branding/PaletaDeCores.md`), tipos por domínio em `types.ts`.

---

## 2. Raiz do repositório (monorepo alvo)

```
OpenSight/
├── frontend/                 # App web (Vite + React + TS) — já existe, self-contained
├── services/                 # Microsserviços (Go/Python) — FUTURO; um diretório por serviço
│   ├── auth-service/                     (Go)
│   ├── consent-service/                  (Go)
│   ├── institution-connector-service/    (Go)  ← evolução do PluggySDKGo atual
│   ├── account-service/                  (Go)
│   ├── transaction-service/              (Go)
│   ├── categorization-service/           (Python + wrapper Go)
│   ├── analytics-service/                (Go)
│   ├── projection-service/               (Go + Python)
│   ├── budget-service/                   (Go)
│   ├── notification-service/             (Go)
│   ├── privacy-service/                  (Go)
│   ├── audit-service/                    (Go)
│   └── cohort-analytics-service/         (Go + Python) ← fase futura (RF-012)
├── packages/                 # Libs Go compartilhadas (ex.: pkg/crypto, contratos de evento, modelo canônico)
├── docs/                     # = "Documentação/" (recomendado renomear p/ ASCII; conteúdo segue pt-BR)
├── branding/                 # = "Branding/" (guia de marca, tokens, assets)
├── deploy/                   # k8s, CI/CD, docker, IaC — FUTURO
├── go.work                   # Workspace Go multi-módulo (no lugar do go.mod único da raiz)
├── CLAUDE.md
├── README.md
└── .gitignore
```

**Notas de migração (raiz):**
- Hoje a raiz tem `go.mod` (módulo `PluggySDK`), `PluggySDKGo/`, `FuncDemos/`, `Documentação/`, `Branding/`, `Testes/` (vazio) e `frontend/`.
- O SDK Go atual passa a viver em `services/institution-connector-service/` (ver §4). `FuncDemos/` vira testes/exemplos co-localizados nesse serviço.
- `go.work` permite múltiplos módulos (um `go.mod` por serviço) sem um módulo gigante na raiz.
- `Testes/` (vazio) deve ser **removido** — testes ficam co-localizados (frontend e cada serviço).
- Renomear `Documentação/ → docs/` e `Branding/ → branding/` (nomes ASCII, minúsculos) evita atritos de tooling/URLs; o conteúdo permanece em pt-BR.

### 2.1 Layout de cada serviço Go (conforme arquitetura §10)

```
services/<nome>-service/
├── cmd/<nome>-service/main.go    # entrypoint
├── internal/                     # domínio + casos de uso + adapters (privado ao serviço)
│   ├── domain/                   # entidades e regras (modelo canônico)
│   ├── app/ (ou usecase/)        # orquestração de casos de uso
│   └── infra/                    # http, db, mensageria, secrets
├── pkg/                          # código exportável (quando houver)
├── go.mod
└── README.md
```

- **`institution-connector-service`** (mais crítico): herda o `GET_ApiKey.go` atual e adiciona a camada **read-only** e o **anti-corruption layer** provider-agnostic:
  - `internal/connector/` — interface estável do agregador (Belvo primário, Pluggy fallback — RNF-012);
  - `internal/connector/readonly_transport.go` — allowlist compile-time de endpoints (enforcement READ-ONLY, §4.4);
  - `internal/connector/endpoints.go` — constantes de endpoints permitidos;
  - mapeia payloads externos → **modelo canônico** (em `packages/` quando compartilhado).
- **`categorization-service`** e **`cohort-analytics-service`** combinam Python (ML) + wrapper Go; o ambiente de ML lê **somente do bucket anonimizado** (arquitetura §6.4/§6.6), sem acesso a bases de produção.

---

## 3. Frontend feature-based (`frontend/src/` alvo)

```
src/
├── app/                      # bootstrap da aplicação
│   ├── main.tsx              # mount React
│   ├── App.tsx               # composição do router
│   ├── routes.tsx            # rotas (derivadas de nav)
│   └── providers.tsx         # ConsentProvider e demais providers globais
│
├── features/                 # um diretório por DOMÍNIO; cada um expõe um barrel index.ts
│   ├── overview/
│   ├── contas/
│   ├── cartoes/
│   ├── investimentos/
│   ├── transacoes/
│   ├── categorias/
│   ├── orcamento/
│   ├── projecoes/
│   ├── benchmarking/
│   ├── alertas/
│   └── privacidade/
│
├── shared/                   # cross-cutting reutilizável (NUNCA importa de features/)
│   ├── ui/                   # Panel, DeltaChip, StatCard, MiniStat, Switch… + barrel
│   ├── charts/               # primitivos + gráficos genéricos + barrel
│   ├── layout/               # Layout, Sidebar, Topbar
│   ├── theme/                # tokens.ts (espelha Branding/PaletaDeCores.md)
│   ├── lib/                  # formatters (brl, brlCompact, pct), niceAxis, prng (rng), helpers
│   ├── context/              # consent.tsx
│   └── nav.ts                # fonte única da navegação
│
└── index.css
```

### 3.1 Anatomia de uma feature

```
features/<dominio>/
├── pages/            # componentes de página (PascalCase.tsx) ligados às rotas
├── components/       # componentes só desta feature
├── charts/           # gráficos específicos do domínio (ver §5)
├── data/             # dados mock do domínio (até o backend existir)
├── hooks/            # hooks da feature (useX.ts)
├── types.ts          # tipos/interfaces do domínio
└── index.ts          # BARREL público — única superfície importável de fora
```

Nem toda feature precisa de todas as pastas — crie só o que existir.

### 3.2 Mapa feature → arquivos atuais → serviço(s)

| Feature | Arquivos atuais (origem) | Serviço(s) backend |
|---|---|---|
| `overview` | `pages/Overview.tsx`; KPIs/saldo/cashflow de `mock.ts` | analytics-service |
| `contas` | `pages/Contas.tsx`, `pages/ContaDetalhe.tsx`, `charts/conta.tsx`, parte de `mock.ts` (`Conta`, `getContaDetalhe`) | account-service |
| `cartoes` | `pages/Cartoes.tsx`, `charts/cartoes.tsx`, mock do cartão | account-service + transaction-service |
| `investimentos` | `pages/Investimentos.tsx`, `charts/investimentos.tsx`, mock da carteira | account-service |
| `transacoes` | `pages/Transacoes.tsx`, `components/TransactionsTable.tsx`, `transacoes` | transaction-service |
| `categorias` | `pages/Categorias.tsx`, mock de categorias/tipos | categorization-service |
| `orcamento` | `pages/Orcamento.tsx`, `components/BudgetList.tsx`, `charts/gauge.tsx`, mock de metas | budget-service |
| `projecoes` | `pages/Projecoes.tsx`, projeção em `charts/basics.tsx` (`ProjectionLines`) | projection-service |
| `benchmarking` | `pages/Benchmarking.tsx`, mock de coorte | cohort-analytics-service |
| `alertas` | `pages/Alertas.tsx`, `alertas` | analytics-service + notification-service |
| `privacidade` | `pages/Privacidade.tsx`, `context/consent.tsx`, `consentimentos` | consent-service + privacy-service |

> **Importante:** "cartões" e "investimentos" são **features de apresentação**, não serviços próprios — são visões sobre account/transaction/analytics. Não inventar serviços fora dos documentados na arquitetura.

### 3.3 Split do `mock.ts` (hoje com ~747 linhas)

Quebrar por domínio, espelhando os serviços, com os tipos junto dos dados:

| Destino | Conteúdo atual de `mock.ts` |
|---|---|
| `features/overview/data/*` | `kpis`, `balanceSeries`, `cashflow`, `evolucaoMensal`, `syncStatus` |
| `features/contas/data/*` | `Conta`, `contas`, `ContaDetalheData`, `getContaDetalhe` |
| `features/cartoes/data/*` | `cartaoResumo`, `faturaHistorico`, `cartaoPorCategoria`, `cartaoLancamentos` |
| `features/investimentos/data/*` | `investResumo`, `carteiraAlocacao`, `carteiraEvolucao`, `rendimentoPorClasse`, `posicoes` |
| `features/transacoes/data/*` | `Transacao`, `transacoes` |
| `features/categorias/data/*` | `categorias`, `categoriasCadastro`, `tiposTransacao`, `paletaCategoria`, treemap/heatmap/hierarquia |
| `features/orcamento/data/*` | `budgets`, `sugestoesOrcamento`, `sugerirMeta`, `gastoPorCategoria`, `comprometimento` |
| `features/projecoes/data/*` | `projecao` |
| `features/benchmarking/data/*` | `cohort` e tipos relacionados |
| `features/alertas/data/*` | `Alerta`, `alertas` |
| `features/privacidade/data/*` | `Consentimento`, `consentimentos` |
| `shared/lib/*` | `rng` (PRNG determinístico), `meses` e demais helpers genéricos |

---

## 4. Convenções de código (frontend)

- **Path aliases `@/`:** configurar `baseUrl`/`paths` no `tsconfig.json` e `resolve.alias` no `vite.config.ts` para `@/* → src/*`. Imports passam a `@/shared/ui`, `@/features/contas`, etc. (fim dos `../../..`).
- **Regras de import:**
  - feature importa de `@/shared/*` à vontade;
  - feature importa de outra feature **somente** via `@/features/<x>` (o barrel) — nunca um arquivo interno;
  - `shared/*` **não** importa de `features/*`.
- **Nomenclatura:** pastas de feature em **minúsculo** (pt-BR, palavra única, como hoje: `contas`, `orcamento`); páginas/componentes em `PascalCase.tsx`; hooks `useX.ts`; utilitários/variáveis em `camelCase`; tipos em `types.ts` por feature.
- **Barrels:** um `index.ts` por feature (superfície pública) e por `shared/ui` e `shared/charts`. Evitar re-exports que criem ciclos.
- **Tipos:** interfaces de domínio ficam em `features/<x>/types.ts`; tipos compartilhados de verdade vão para `shared/`.

---

## 5. Gráficos, marca e tema (regras que não mudam)

- **Onde cada gráfico vive:**
  - **genéricos/primitivos** → `shared/charts` (hoje: `shared.tsx`, `basics`, `timeseries`, `donuts`, `treemap`, `sankey`, `gauge`, `waterfall`, `heatmaps`, `statistical`) com **barrel**;
  - **específicos de domínio** → `features/<x>/charts` (hoje: `conta.tsx` → contas, `investimentos.tsx` → investimentos, `cartoes.tsx` → cartoes).
  - Páginas importam genéricos de `@/shared/charts` e os específicos do **barrel da própria feature**. *(Isto substitui a regra atual do `CLAUDE.md` "pages import only from '../charts'", que deve ser atualizada na migração — ver §6 Fase C.)*
- **Recharts direto, não os charts do Tremor** (cores exatas em HEX vêm de `theme/tokens.ts`).
- **Double-Red:** crimson de marca `#C1121F` ≠ loss `#E5484D`. Use `palette.gain`/`palette.loss` para sobe/desce financeiro; crimson/ember só para marca e ações primárias.
- **`isAnimationActive={false}`** nas séries (renderização imediata, inclusive em screenshot headless).
- **Formatadores BR** (`brl`, `brlCompact`, `pct`) e `niceAxis()` ficam em `shared/lib`/`shared/theme` — reusar, não reescrever.
- **`tokens.ts` é fonte única** e espelha `branding/PaletaDeCores.md` — manter em sincronia.

---

## 6. Roteiro de migração incremental

Cada fase mantém o build verde (`npm run build`, que roda `tsc --noEmit`). Idealmente uma fase por PR/commit.

- **Fase A — preparação (sem mover a árvore, baixo risco):**
  - adicionar aliases `@/` (tsconfig + vite);
  - quebrar `mock.ts` por domínio (§3.3) e extrair `types.ts`;
  - extrair helpers genéricos (`rng`, `meses`, formatadores) para `shared/lib`.
- **Fase B — núcleo compartilhado:** criar `app/` e `shared/` (ui, charts, layout, theme, lib, context) e mover os arquivos atuais correspondentes; atualizar imports para `@/shared/*`.
- **Fase C — features:** migrar **um domínio por vez** para `features/<x>/` (página + componentes + charts específicos + data + types + barrel); atualizar a regra de gráficos e o `CLAUDE.md`.
- **Fase D — raiz/monorepo:** criar `services/` + `go.work`; mover o SDK Go para `institution-connector-service`; renomear `Documentação/→docs/` e `Branding/→branding/`; remover `Testes/` vazio.

---

## 7. Testes

- **Frontend:** ainda **sem runner**; o gate de qualidade é `npm run build` (com `tsc --noEmit` estrito: `noUnusedLocals`/`noUnusedParameters`). Ao adicionar testes, co-localizar (`*.test.ts(x)`) por feature.
- **Backend:** testes co-localizados por serviço (`*_test.go`), incluindo testes que **verificam o enforcement READ-ONLY** (rejeitar PUT/PATCH/DELETE) no `institution-connector-service`.

---

## 8. Histórico

| Versão | Data | Descrição |
|---|---|---|
| 0.1.0 | 02/06/2026 | Versão inicial do guia de estrutura/convenções (monorepo + frontend feature-based). Proposta alvo; migração incremental (não aplicada ainda). |
