 Plano — Documentar a estrutura de pastas/arquivos alvo (monorepo + frontend feature-based)

 Contexto

 O projeto cresceu rápido (frontend com 12 páginas, ~13 módulos de gráficos, mock.ts com 747 linhas
 misturando todos os domínios; raiz do repositório mistura Go, docs, branding e o app web). Antes de
 continuar implementando, o dono quer definir a estrutura de pastas/arquivos alvo que siga os padrões
 arquiteturais já descritos em Documentação/ArquiteturaOpenSight.md (12+1 microsserviços, READ-ONLY,
 provider-agnostic) e princípios de código limpo / DDD.

 Decisões do usuário (já tomadas):
 - Escopo: frontend e a raiz do monorepo (onde os serviços vão morar) — sem implementar backend.
 - Paradigma do frontend: feature-based por domínio (espelha os microsserviços).
 - Execução: apenas documentar o padrão-alvo — nenhum arquivo é movido/renomeado agora. Nenhuma mudança de
 código.

 Resultado esperado: um guia versionado que serve de referência para organizar o repositório quando a
 migração for executada, com um roteiro de migração incremental.

 Entregável (único)

 Criar Documentação/EstruturaDeProjeto.md (pt-BR, sem mover nada). Opcional: 1 linha de ponteiro em
 CLAUDE.md e README apontando para o guia. (São os únicos arquivos tocados — tudo é documentação.)

 ▎ Observação de convenção: o doc de arquitetura usa corpo sem acentos (ASCII); o SRS usa acentos.
 ▎ EstruturaDeProjeto.md segue o estilo dos demais docs em Documentação/ (com acentos, como o SRS).

 Conteúdo do EstruturaDeProjeto.md

 1. Princípios

 - Feature-based / "screaming architecture": a estrutura grita o domínio, não o framework.
 - Direção de dependência para dentro: features/* dependem de shared/*; shared/* nunca importa de
 features/*; features não se importam por caminho profundo (só via barrel público).
 - Espelhar os limites dos microsserviços (cada feature mapeia para um/poucos serviços).
 - READ-ONLY e provider-agnostic preservados no backend (refs à ArquiteturaOpenSight.md §4.4, RNF-012).
 - Working language pt-BR.

 2. Raiz do repositório (monorepo alvo)

 Descrever a árvore alvo e o papel de cada pasta:
 OpenSight/
 ├── frontend/          # app web (Vite+React) — já existe, self-contained
 ├── services/          # microsserviços (Go/Python) — FUTURO, um dir por serviço
 │   ├── auth-service/  consent-service/  institution-connector-service/
 │   ├── account-service/  transaction-service/  categorization-service/
 │   ├── analytics-service/  projection-service/  budget-service/
 │   ├── notification-service/  privacy-service/  audit-service/
 │   └── cohort-analytics-service/        # fase futura (RF-012)
 ├── packages/          # libs Go compartilhadas (ex.: pkg/crypto, contratos de evento)
 ├── docs/              # = "Documentação/" (recomendar rename ASCII; manter conteúdo pt-BR)
 ├── branding/          # = "Branding/"
 ├── deploy/            # k8s / CI-CD / docker (futuro)
 ├── go.work            # workspace Go multi-módulo (substitui go.mod único da raiz)
 └── CLAUDE.md · README.md · .gitignore
 - Cada serviço Go segue o layout já definido na arquitetura §10: cmd/<svc>/main.go, internal/..., pkg/...,
 go.mod, README.md. O PluggySDKGo/ + FuncDemos/ atuais passam a ser
 services/institution-connector-service/internal/pluggy/... (com o readonly_transport.go/endpoints.go da
 arquitetura). categorization-service e cohort-analytics-service são Python+Go.
 - Notas: Testes/ vazio → remover (testes co-localizados por serviço/feature); go.work para múltiplos
 módulos; mover o go.mod/SDK da raiz para o serviço.

 3. Frontend feature-based (frontend/src/ alvo)

 src/
 ├── app/        # bootstrap: App.tsx (router), main.tsx, routes.tsx, providers.tsx
 ├── features/   # um dir por domínio, cada um com barrel index.ts público
 │   ├── overview/  contas/  cartoes/  investimentos/  transacoes/
 │   ├── categorias/  orcamento/  projecoes/  benchmarking/
 │   ├── alertas/  privacidade/
 │   │     └── (por feature) pages/  components/  charts/  data/  types.ts  hooks/  index.ts
 ├── shared/     # cross-cutting reutilizável
 │   ├── ui/        # Panel, DeltaChip, StatCard, MiniStat, Switch…
 │   ├── charts/    # primitivos + gráficos genéricos (shared.tsx, basics, timeseries, donuts, treemap,
 sankey, gauge, waterfall, heatmaps, statistical) + barrel
 │   ├── layout/    # Layout, Sidebar, Topbar
 │   ├── theme/     # tokens.ts (espelha Branding/PaletaDeCores.md)
 │   ├── lib/       # formatters (brl, brlCompact, pct), niceAxis, prng (rng)
 │   ├── context/   # consent.tsx (ou em features/privacidade) + nav.ts
 └── index.css
 - Mapa feature → arquivos atuais → serviço(s): tabela explícita. Ex.: contas (Contas, ContaDetalhe,
 charts/conta.tsx, parte de mock) → account-service; cartoes→account/transaction; investimentos→account;
 transacoes→transaction; categorias→categorization; orcamento→budget; projecoes→projection;
 benchmarking→cohort-analytics; alertas→analytics+notification; privacidade→consent+privacy;
 overview→analytics.
 - Regra de gráficos (mantendo o padrão atual): genéricos/primitivos em shared/charts (barrel); gráficos
 específicos de domínio (conta.tsx, investimentos.tsx, cartoes.tsx) vão para features/<x>/charts. Páginas
 importam genéricos de @/shared/charts e os específicos do barrel da própria feature. (Atualiza a regra do
 CLAUDE.md "pages import only from '../charts'".)
 - Split do mock.ts (747 linhas): quebrar por domínio em features/<x>/data/*.ts (espelhando os serviços) +
 helpers compartilhados (shared/lib para rng, meses). Tabela do que vai pra onde.

 4. Convenções de código

 - Path aliases: adicionar @/* → src/* em tsconfig.json (baseUrl+paths) e vite.config.ts (resolve.alias).

     4. Convenções de código

     - Path aliases: adicionar @/* → src/* em tsconfig.json (baseUrl+paths) e vite.config.ts
     (resolve.alias). Imports passam a @/shared/..., @/features/....
     - Imports entre features: só via barrel features/<x>/index.ts; proibidos deep-imports cross-feature;
     shared não importa features.
     - Nomenclatura: pastas de feature em minúsculo (pt-BR, palavra única, como hoje); componentes/páginas
     PascalCase.tsx; hooks useX.ts; utils camelCase; tipos em types.ts por feature.
     - Barrels: um index.ts por feature (superfície pública) e por pasta de shared/ui e shared/charts.
     - Regras de marca/tema preservadas: tokens.ts como fonte única (sincronia com
     Branding/PaletaDeCores.md); regra do double-red (crimson ≠ loss); isAnimationActive={false};
     formatadores BR em shared/lib.
     - Testes: front sem runner (gate = npm run build com tsc --noEmit); backend com testes co-localizados
     por serviço.

     5. Roteiro de migração incremental (para execução futura, faseado, build verde a cada passo)

     - Fase A (baixo risco, sem mover árvore): adicionar aliases @/; quebrar mock.ts por domínio; extrair
     types.ts.
     - Fase B: criar app/, shared/ (ui, charts, layout, theme, lib, context) e migrar os atuais para lá.
     - Fase C: migrar domínio por domínio para features/<x>/ (uma feature por commit), atualizando barrels e
     a regra de charts; ajustar CLAUDE.md.
     - Fase D (raiz/monorepo): services/ + go.work, mover o SDK Go para institution-connector-service,
     renomear Documentação/→docs/ e Branding/→branding/, remover Testes/ vazio.

     Arquivos que serão criados/tocados

     - Criar: Documentação/EstruturaDeProjeto.md (o guia completo acima).
     - Opcional (ponteiro): 1 linha em CLAUDE.md (seção de layout) e em README referenciando o guia.
     - Nenhum arquivo de código é movido, renomeado ou editado nesta etapa.

     Verificação

     Tarefa 100% documental:
     1. git status deve mostrar apenas o novo .md (e, se feito, o ponteiro no CLAUDE.md) — nenhum arquivo de
     código alterado.
     2. Conferir que o mapa feature→serviço bate com os serviços de ArquiteturaOpenSight.md (sem inventar
     serviços; cartões/investimentos são features de apresentação sobre account/transaction/analytics).
     3. Conferir que o layout Go citado bate com a arquitetura §10 e RNF-012 (READ-ONLY/provider-agnostic).
     4. Revisar render do markdown (tabelas/árvores) no preview.