# Progresso de Implementação — OpenSight

**Atualizado:** 05/06/2026 · **Status:** em desenvolvimento ativo

> **Ver também:** [Arquitetura](ArquiteturaOpenSight.md) · [SRS](<SRSGestorFinanceiro(0.0.005).MD>) · [Estrutura de Projeto](EstruturaDeProjeto.md) · [Diagramas](DiagramaArquitetural.md).

Resumo do que está implementado vs. o roadmap da arquitetura. Princípio de
segurança central já valendo: **o frontend nunca executa SQL nem acessa o banco**
— fala apenas com APIs HTTP, que usam **queries parametrizadas**, **isolamento
por usuário** e **JWT**.

## Backend (monorepo Go, `go.work`)

| Módulo | Porta | O que faz | Status |
|---|---|---|---|
| `packages/contracts` | — | Modelo canônico compartilhado (Transaction, Account, TxType; centavos) | ✅ |
| `institution-connector-service` | — | Conector **Pluggy READ-ONLY** (allowlist compile-time, cache apiKey 2h) + **pipeline de sync** (canonical → Persister; `cmd/sync`) | ✅ código; falta rodar real |
| `auth-service` | 8082 | Cadastro/login + **JWT RS256** (bcrypt 12, política de senha, `/me`, `/public-key`) | ✅ |
| `account-service` | 8081 | API de contas + histórico de saldo; repo memória/Postgres parametrizado | ✅ |
| `transaction-service` | 8083 | API de transações (modelo canônico); filtro por conta | ✅ |
| analytics-service | 8084 | Overview + insights de categorias + anomalias (gráficos avançados) | ✅ memória/**Postgres** (read-model CQRS) |
| budget-service | 8085 | Metas, sugestões automáticas (média 3m −10%), comprometimento de receita | ✅ memória/**Postgres** |
| projection-service | 8086 | Cenários de projeção (otimista/realista/pessimista/ajustado) | ✅ memória/**Postgres** |
| consent-service | 8087 | Consentimentos de Open Finance (instituições, escopos, status) | ✅ memória/**Postgres** |
| cohort-service | 8088 | Benchmarking de coorte (comparativos, drivers, recomendações) | ✅ memória/**Postgres** |
| cards-service | 8089 | Cartões de crédito (resumo, faturas, gastos por categoria, lançamentos) | ✅ memória/**Postgres** |
| investments-service | 8090 | Carteira (resumo, alocação, evolução, rentabilidade por classe, posições) | ✅ memória/**Postgres** |
| categorization-service | 8091 | Categorias + tipos de transação (RF-004) e breakdown por categoria | ✅ memória/**Postgres** |
| privacy-service | 8092 | Direitos do titular LGPD (portabilidade/eliminação); repo concorrente | ✅ memória/**Postgres** |
| notification-service | 8093 | Feed consolidado de alertas (anomalia/orçamento/consentimento) | ✅ memória/**Postgres** |
| audit-service | 8094 | Trilha de auditoria append-only imutável (backend-only) | ✅ memória/**Postgres** (com teste) |
| **packages/httpkit** | — | Lib compartilhada: respostas JSON, middlewares de segurança, JWT/Authn, LoadConfig | ✅ |

**Segurança aplicada nos serviços:** transporte READ-ONLY no conector (5 camadas,
§4.4); JWT RS256 validado via `Authn` quando `AUTH_PUBLIC_KEY` está setado (senão
modo dev); CORS allowlist; security headers; logs sem PII; timeouts + graceful
shutdown; `database-per-service` com migrations anotando RLS/menor privilégio/sem
PII; segredos fora do código (`.env` por serviço; produção via Secrets Manager).

## Frontend (Vite + React, feature-based)

- **Estrutura:** `app/` + `features/<domínio>/` + `shared/` (ui, layout, theme, lib, context, charts, **auth**, **api**), aliases `@/`.
- **Autenticação:** tela de Login (login/registro/**modo demo**), JWT em `localStorage`, header `Bearer` automático, guard de rotas, logout.
- **Integração (live quando o backend está no ar; fallback ao mock):**
  - Contas ✅ · Transações ✅ (com nome amigável da conta) · ContaDetalhe ✅ (conta + transações; histórico via balance-history) · Overview ✅ (patrimônio + últimas transações + cashflow/categorias/série de saldo via analytics).
  - Orçamento ✅ (budget-service: metas, sugestões, comprometimento) · Projeções ✅ (projection-service) · Privacidade ✅ (consent-service) · Benchmarking ✅ (cohort-service).
  - Cartões ✅ (cards-service) · Investimentos ✅ (investments-service).
  - Categorias ✅ (categorization-service + **gráficos avançados via analytics-service**: treemap/sunburst/heatmap/bolhas/radar/box) · Alertas ✅ (notification-service + **scatter de anomalias via analytics**) · Direitos LGPD ✅ (privacy-service: botões Exportar/Excluir).
- **Cobertura:** todas as 11 páginas e todos os gráficos consomem seus serviços (fallback ao mock quando offline). Os 8 gráficos avançados viraram componentes data-driven servidos pelos endpoints `GET /api/v1/analytics/categories` e `/anomalies`.

## Como rodar (dev)

Backend (Go é Windows-side neste WSL; caches no D:):
```bash
cd services/auth-service        && go run ./cmd/auth-service        # :8082
cd services/account-service     && go run ./cmd/account-service     # :8081
cd services/transaction-service && go run ./cmd/transaction-service # :8083
cd services/analytics-service   && go run ./cmd/analytics-service   # :8084
```
Frontend: `cd frontend && npm run dev` → tela de login (crie conta ou **modo demo**).

Postgres + sync real (Open Finance → DB): subir `deploy/` (Docker Desktop) e rodar
`services/institution-connector-service/cmd/sync` com creds Pluggy + `*_DATABASE_URL`.

## Pendências priorizadas
1. Rodar o **sync real** (creds Pluggy + Postgres do `deploy/`).
2. Job de **precompute** das agregações do analytics (hoje servidas de seed).
3. Demais serviços de domínio (budget, projection, consent/privacy, etc.).
4. Wiring dos gráficos de Categorias/Projeções; dados reais de Cartões/Investimentos.
5. Evoluir o sync para **eventos** (broker) em vez de escrita direta nos DBs.
