# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

OpenSight is a **personal finance SaaS** that connects to Brazilian Open Finance via an **Open Finance aggregator**, operating strictly **READ-ONLY** (it never moves money — this is a hard, multi-layered invariant). It is **security-first / defense-in-depth** and targets LGPD, Banco Central Open Finance, ISO 27001 and PCI DSS compliance.

**Aggregator (important — recent decision):** The chosen aggregator is now **Belvo** (initial / MVP provider), with **Pluggy** kept as a future alternative/fallback. The SRS (`SRSGestorFinanceiro(0.0.005).MD`, RNF-012) mandates a **provider-agnostic** design: the aggregator integration lives behind a single connector layer (anti-corruption layer) that maps external payloads to a canonical internal model, and READ-ONLY is enforced in that connector regardless of provider. **Note the gap:** the existing backend code is the Go **Pluggy** connector (`services/institution-connector-service/`, read-only, with auth + accounts/transactions/items/identity/investments) and the architecture doc is still Pluggy-specific — these predate the Belvo decision and have not yet been migrated. When writing new connector code, target Belvo and keep it provider-agnostic; treat the Pluggy connector as the alternative-provider implementation, not the canonical one. (Belvo auth uses `secretId`/`secretPassword`, not Pluggy's `clientId`/`clientSecret`.)

The repo is **early-stage**: a documented target architecture plus two working pieces — a Go Pluggy SDK (just the auth/API-key layer so far) and a fully built React dashboard frontend (mock data, no backend wired yet). Most of the 12-microservice architecture in `Documentação/ArquiteturaOpenSight.md` is **not yet implemented**; treat that doc as the roadmap, not the current state. Working language of docs, comments, and commits is **Portuguese (pt-BR)**.

## Repository layout

- `packages/` — shared Go modules. **`packages/contracts/`** (`module opensight/packages/contracts`, no deps) = the **canonical model** (provider-agnostic, RNF-012): `Transaction`, `Account`, `TxType`, money in cents. Services depend on it via `go.work` + a `replace` to the local path; it is the vocabulary the connector maps Pluggy/Belvo payloads into and the domain services consume.
- `services/` — backend microservices (one Go module each), tied together by `go.work` at the repo root. Four so far:
  - **`institution-connector-service/`** (`module opensight/services/institution-connector-service`): the read-only Pluggy connector **+ sync pipeline**. `internal/connector/` = client + read-only transport + read functions; `internal/canonical/` maps Pluggy DTOs → `contracts` (anti-corruption layer); `internal/sync/` orchestrates **Pluggy(read) → canonical → Persister** behind `Reader`/`Persister` ports (`MemoryPersister` + `PostgresPersister` that upserts into account_db/transaction_db with parameterized `ON CONFLICT`). `cmd/sync` runs it (`PLUGGY_ITEM_ID` + optional `ACCOUNT_DATABASE_URL`/`TRANSACTION_DATABASE_URL`); `cmd/connector-service`/`cmd/apikey-demo` smokes. Uses `opensight/packages/contracts` (via `replace`). (Evolved from the former `PluggySDKGo/` + `FuncDemos/`.)
  - **`account-service/`** (`module opensight/services/account-service`): HTTP API of consolidated accounts. **The frontend calls this API; it never runs SQL / touches the DB.** Clean layering: `internal/domain` (canonical `Account`, cents), `internal/repository` (`AccountRepository` iface + `MemoryRepo` seed for dev + `PostgresRepo` using `database/sql` with **parameterized** queries, scoped by `user_id`), `internal/api` (router/handlers/auth stub + `httpx` middleware: recover, CORS allowlist, security headers, logging), `internal/config`, `internal/platform` (pgx pool). `migrations/0001_accounts.sql` = `account_db` schema with security notes (RLS, least-privilege role, no PII). Endpoints: `GET /healthz`, `GET /api/v1/accounts`, `GET /api/v1/accounts/{id}`. Runs with the in-memory repo when `DATABASE_URL` is unset; with it set, uses Postgres via the **`pgx/v5/stdlib`** driver (registered by a blank import in `cmd/account-service/driver_pgx.go`). **Auth:** `Authn` middleware validates a Bearer **JWT RS256** when `AUTH_PUBLIC_KEY`/`_FILE` is set (verifier in `internal/token`); without it, dev fallback (`X-User-ID`/seed user).
  - **`auth-service/`** (`module opensight/services/auth-service`, port :8082): register/login + **JWT RS256** issuance. `internal/domain` (User, password policy ≥12), `internal/repository` (bcrypt-hashed users, memory + Postgres), `internal/token` (RSA signer/verifier; ephemeral key in dev, `JWT_PRIVATE_KEY`/`_FILE` in prod), `internal/api` (register/login/me/public-key). bcrypt cost 12; generic login errors; `migrations/0001_users.sql` = `auth_db`. Deps: `golang-jwt/jwt/v5`, `golang.org/x/crypto/bcrypt`. The account-service consumes its public key to enforce JWT.
  - **`transaction-service/`** (`module opensight/services/transaction-service`, port :8083): HTTP API of transactions using the canonical `opensight/packages/contracts` types (cross-module via `replace`). Same secure pattern: `internal/repository` (memory seed + Postgres parameterized, scoped by `user_id`, optional `accountId` filter), `internal/token`+`Authn` JWT, `httpx` middleware, `migrations/0001_transactions.sql` (`transaction_db`). Endpoint `GET /api/v1/transactions?accountId=`.
- `frontend/` — Vite + React 18 + TS dashboard (see below). Self-contained; has its own `package.json`.
- `Documentação/` — architecture (`ArquiteturaOpenSight.md`), the SRS, `SDK/` API docs, and `EstruturaDeProjeto.md` (target folder/file structure & conventions — monorepo + frontend feature-based; proposed, not yet migrated). The architecture doc is the canonical design spec.
- `Branding/` — "Warmind Carmesim" visual system: brand guide, color palette, typography, plus `Assets/` (SVG/PNG) and `Tokens/` (CSS + JSON design tokens).

## Commands

### Go (multi-module workspace via `go.work`)
`go` is **not on the bash PATH** (Windows-side, like Node) — use `go.exe` directly or `export PATH="$PATH:/mnt/c/Program Files/Go/bin"`. **C: is full**, so the Go caches were relocated to **D:** via `go env -w GOMODCACHE=D:\go\pkg\mod GOCACHE=D:\go\cache GOTMPDIR=D:\go\tmp` (persisted; module downloads, build cache and link temp all live on D: now). Root `./...` patterns are finicky with the Windows `go.exe` under a workspace, so build **from inside the module**:
```bash
cd services/institution-connector-service
go build ./...   # build      ·   go vet ./...   # vet
go test ./...    # tests (incl. the READ-ONLY allowlist test)
go run ./cmd/connector-service   # auth smoke; lists accounts if PLUGGY_ITEM_ID is set
go run ./cmd/apikey-demo         # apiKey cache demo
gofmt -l .       # formatting check (must be empty)
# account-service:
cd ../account-service && go test ./... && go run ./cmd/account-service   # API on :8081 (memory repo if no DATABASE_URL)
```
Each service reads a `.env` **at its own root** (gitignored) with `PLUGGY_CLIENT_ID`/`PLUGGY_CLIENT_SECRET` (+ optional `PLUGGY_ITEM_ID`); `godotenv` loads it in `init()`. See `EstruturaDeProjeto.md` for the `.env` placement rules. Without valid creds the smoke hits `api.pluggy.ai/auth` and errors.

### Frontend (run from `frontend/`)
```bash
npm install
npm run dev              # vite dev server on :5173 (auto-opens browser)
npm run build            # tsc --noEmit (type-check) THEN vite build
npm run preview          # serve the production build
```
There is **no linter or test runner** configured for the frontend — `npm run build` (with its `tsc --noEmit` gate) is the only check. `tsconfig` is strict, including `noUnusedLocals`/`noUnusedParameters`, so unused symbols fail the build.

### Dev environment gotcha (WSL + Windows Node)
`node`/`npm` are **not on the bash PATH** (return 127) — Node is installed Windows-side. Before any npm command:
```bash
export PATH="$PATH:/mnt/c/Program Files/nodejs"
```
To screenshot SVGs or the running app there is no rsvg/cairo/pip; use **Chrome headless** with **Windows-style paths** (`C:\...`, `file:///C:/...`), not `/mnt/c`:
```bash
"/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu \
  --force-device-scale-factor=2 --window-size=1440,900 \
  --screenshot="C:\path\out.png" "http://localhost:4178/"
```
Recharts renders **empty** (axes only) in headless screenshots because of entry animation — set `isAnimationActive={false}` on series to make it render immediately. Don't `pkill -f vite`/`pkill -f node` — the pattern matches the bash process and kills your own shell; kill by PID.

## Connector architecture (`services/institution-connector-service/internal/connector`)

A thread-safe, read-only Pluggy client (anti-corruption layer). `connector.New(creds)` / `NewFromEnv()` build a `*Client`; `Client.APIKey(ctx)` returns a cached apiKey or fetches one via `POST /auth`; read methods are `ListAccounts`/`GetAccount`, `ListTransactions` (auto-paginates), `GetItem`, `GetIdentity`, `ListInvestments`. Key design points:
- **READ-ONLY transport (Layer 1, §4.4)**: `readonly_transport.go` wraps the `http.RoundTripper` and rejects any request outside the compile-time allowlist in `endpoints.go` (`POST /auth` + GETs only; never PUT/PATCH/DELETE). `New` re-wraps even an injected `http.Client` so it can't be bypassed. Covered by `TestIsAllowed`.
- **apiKey cache with safety margin**: Pluggy apiKeys live **2h**; cached for **1h55m** (`apiKeyCacheTTL = apiKeyValidity - apiKeySafetyMargin`) to avoid clock-skew/expiry races. Per-`Client` cache guarded by `sync.RWMutex` with **double-checked locking** in `fetchAPIKey`. `APIKeyExpiration()` / `ClearAPIKey()` for debug/tests.
- Auth uses the **`X-API-KEY`** header on every read; credentials come from `.env` (`PLUGGY_CLIENT_ID`/`PLUGGY_CLIENT_SECRET`) or are passed explicitly.
- Models in `models.go` are Pluggy-edge DTOs; when the **provider-agnostic** canonical model (RNF-012) is extracted, the mapping lives in this anti-corruption layer. Target aggregator is **Belvo** (auth `secretId`/`secretPassword`) with Pluggy as fallback — keep the same read-only-transport pattern behind a stable interface. The READ-ONLY restriction is enforced in 5 independent layers (architecture §4.4) — preserve that intent.

## Frontend architecture (`frontend/`)

Stack: Vite + React 18 + TypeScript + Tailwind + **Tremor** (Card/ProgressBar) + **Recharts** (all charts) + **React Router**. SPA, 8 pages, **mock data only** (no API calls yet).

**Responsiveness is a first-class requirement** (SRS RNF-008): the app targets full use on **both desktop (PC) and mobile** — same responsive web app, no reduced "mobile version". Every screen must work from ~320px to 1920px+ with **functional parity** across breakpoints: tables reflow to cards/lists, the sidebar collapses to a menu, charts resize/reflow (not just shrink). When adding or changing any UI, verify it at mobile (~375px), tablet (~768px), and desktop (~1440px) — e.g. via the Chrome-headless `--window-size` workflow above.

**Structure is feature-based** (migrated per `Documentação/EstruturaDeProjeto.md`) with `@/*` path aliases → `src/*` (set in `tsconfig.json` `paths` + `vite.config.ts` alias). Import via `@/...`, not deep relative paths. Dependency direction: `features/*` may import `@/shared/*`; **`shared/*` never imports `features/*`**.
- **`src/app/`** — bootstrap: `main.tsx` (mounts; imports `../index.css`) and `App.tsx` (router; imports pages from `@/features/<x>/pages/...`).
- **`src/shared/`** — cross-cutting: `ui/` (`Panel`, `DeltaChip`, `StatCard` — barrel `@/shared/ui`), `layout/` (`Layout`, `Sidebar`, `Topbar`), `theme/tokens.ts`, `lib/mock-helpers.ts` (`rng`, `meses`), `context/consent.tsx`, `nav.ts`, and `charts/` (generic charts).
- **`src/features/<dominio>/`** — one dir per domain (`overview, contas, cartoes, investimentos, transacoes, categorias, orcamento, projecoes, benchmarking, alertas, privacidade`), each with `pages/`, optional `components/` and `charts/`, and `data.ts`.
- **Navigation single-sourced** in `@/shared/nav.ts` (`navItems`) — consumed by `Sidebar`, `Topbar`, routes in `app/App.tsx`. Add a page = nav item + route + `features/<x>/pages/*.tsx`.
- **Layout & collapsible sidebar** (`shared/layout/Layout.tsx`): owns `sidebarOpen`; `Topbar` hamburger toggles. `Sidebar` is out-of-flow on desktop (content reflows full-width, `lg:hidden`/`lg:static`) and an overlay drawer on mobile (`fixed` + `translate-x`). Default open ≥1024px. `Layout`/`main` use `min-w-0` so content can't overflow the flex row.
- **Mock data** is decomposed per domain into `features/<x>/data.ts` (mirroring the services); `src/data/mock.ts` is a **compat barrel** re-exporting all of them, so legacy `@/data/mock` imports still work (pages currently use the barrel; per-feature imports are the eventual target). Heatmaps/scatter use the deterministic `rng()` from `@/shared/lib/mock-helpers`.
- **Charts**: generic/primitive charts in `@/shared/charts` (barrel `index.ts`: `shared.tsx` = `ResponsiveWrap`/`MiniTooltip`/`DarkTooltip`/`fmtMes`/`rampEmber`, plus `basics`, `timeseries`, `donuts`, `treemap`, `sankey`, `gauge`, `waterfall`, `heatmaps`, `statistical`); **domain charts live in their feature** (`features/contas/charts/conta.tsx`, `features/investimentos/charts/investimentos.tsx`, `features/cartoes/charts/cartoes.tsx`, props-driven, importing primitives from `@/shared/charts/shared`). Pages import generic charts from `@/shared/charts` and domain charts from their feature's `charts/`. **To add a chart**: generic → matching `shared/charts` module (or new module + one `export *` in its `index.ts`); domain-specific → `features/<x>/charts`; reuse `shared.tsx` helpers, never re-roll tooltips/wrappers.

### Brand / color rules (don't break these)
- Charts use **Recharts directly, not Tremor's chart components**, because Tremor's `colors` prop only takes Tailwind color *names*, and the brand needs exact HEX. Chart colors come from `src/shared/theme/tokens.ts` (`palette`, `chartColors`, `axisStyle`), which mirrors `Branding/PaletaDeCores.md` — keep them in sync.
- **Double-Red rule**: brand crimson `#C1121F` ≠ loss red `#E5484D`. Use `palette.gain`/`palette.loss` for financial up/down; reserve crimson/ember for brand and primary actions only.
- `src/shared/theme/tokens.ts` also provides BR formatters (`brl`, `brlCompact`, `pct`) and `niceAxis()` for rounded axis ticks — use these rather than re-rolling currency/axis formatting.
- `tailwind.config.js` is **ESM** (`"type": "module"` in package.json) — use `import`, not `require`, for plugins.
