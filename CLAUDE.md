# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

OpenSight is a **personal finance SaaS** that connects to Brazilian Open Finance via an **Open Finance aggregator**, operating strictly **READ-ONLY** (it never moves money — this is a hard, multi-layered invariant). It is **security-first / defense-in-depth** and targets LGPD, Banco Central Open Finance, ISO 27001 and PCI DSS compliance.

**Aggregator (important — recent decision):** The chosen aggregator is now **Belvo** (initial / MVP provider), with **Pluggy** kept as a future alternative/fallback. The SRS (`SRSGestorFinanceiro(0.0.005).MD`, RNF-012) mandates a **provider-agnostic** design: the aggregator integration lives behind a single connector layer (anti-corruption layer) that maps external payloads to a canonical internal model, and READ-ONLY is enforced in that connector regardless of provider. **Note the gap:** the only existing code is the Go **Pluggy** SDK (`PluggySDKGo/`) and the architecture doc is still Pluggy-specific — these predate the Belvo decision and have not yet been migrated. When writing new connector code, target Belvo and keep it provider-agnostic; treat the Pluggy SDK as the alternative-provider implementation, not the canonical one. (Belvo auth uses `secretId`/`secretPassword`, not Pluggy's `clientId`/`clientSecret`.)

The repo is **early-stage**: a documented target architecture plus two working pieces — a Go Pluggy SDK (just the auth/API-key layer so far) and a fully built React dashboard frontend (mock data, no backend wired yet). Most of the 12-microservice architecture in `Documentação/ArquiteturaOpenSight.md` is **not yet implemented**; treat that doc as the roadmap, not the current state. Working language of docs, comments, and commits is **Portuguese (pt-BR)**.

## Repository layout

- `PluggySDKGo/` — Go module (`module PluggySDK`, package `PluggySDK`). The real code. `GET_ApiKey.go` is the Pluggy auth client; `SubRoutines.go` is a near-empty stub for future endpoints.
- `FuncDemos/` — `package main` demos that exercise the SDK (`ApiKeyTeste.go`).
- `frontend/` — Vite + React 18 + TS dashboard (see below). Self-contained; has its own `package.json`.
- `Documentação/` — architecture (`ArquiteturaOpenSight.md`), the SRS, and `SDK/` API docs. The architecture doc is the canonical design spec.
- `Branding/` — "Warmind Carmesim" visual system: brand guide, color palette, typography, plus `Assets/` (SVG/PNG) and `Tokens/` (CSS + JSON design tokens).

## Commands

### Go (run from repo root)
```bash
go build ./...           # build everything
go run ./FuncDemos       # run the API-key cache demo (needs a real .env with Pluggy creds)
go vet ./...             # vet
go test ./...            # tests (none exist yet)
```
The SDK needs a `.env` at repo root (gitignored) with `PLUGGY_CLIENT_ID` and `PLUGGY_CLIENT_SECRET`; `godotenv` loads it in `init()`. Without valid creds the demo hits `api.pluggy.ai/auth` and errors.

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

## Go SDK architecture (`PluggySDKGo/GET_ApiKey.go`)

A thread-safe, self-caching Pluggy auth client. `GetApiKey(creds ...Credentials)` returns a cached key or fetches a new one via `POST api.pluggy.ai/auth`. Key design points:
- **Cache with safety margin**: Pluggy keys live 30 min; the cache expires them at **28 min** (`CacheEffectiveTime = ApiKeyValidityTime - CacheSecurityMargin`) to avoid clock-skew/expiry races.
- **Double-checked locking** with `sync.RWMutex`: `GetApiKey` reads under RLock; on miss `fetchNewApiKey` takes the write lock and re-checks before making the HTTP call, so concurrent callers trigger only one request.
- Global cache singleton `apiKeyCache`. `ClearCache()` and `GetCachedKeyExpiration()` exist for tests/debugging.
- Credentials come from `.env` by default, or can be passed explicitly.

When this grows into `institution-connector-service`, the architecture doc (§10, §4.4) requires wrapping the `http.Client` with a **read-only HTTP transport** that enforces a compile-time endpoint allowlist (only `POST /auth` plus specific GETs; empty PUT/PATCH/DELETE). The READ-ONLY restriction is enforced in 5 independent layers — preserve that intent in any connector code. Note the allowlist/endpoints in the architecture doc are written against **Pluggy**; the current target aggregator is **Belvo** (see "What this is"), so new connector work should target Belvo's API while keeping the same read-only-transport pattern behind a provider-agnostic interface (SRS RNF-012).

## Frontend architecture (`frontend/`)

Stack: Vite + React 18 + TypeScript + Tailwind + **Tremor** (Card/ProgressBar) + **Recharts** (all charts) + **React Router**. SPA, 8 pages, **mock data only** (no API calls yet).

**Responsiveness is a first-class requirement** (SRS RNF-008): the app targets full use on **both desktop (PC) and mobile** — same responsive web app, no reduced "mobile version". Every screen must work from ~320px to 1920px+ with **functional parity** across breakpoints: tables reflow to cards/lists, the sidebar collapses to a menu, charts resize/reflow (not just shrink). When adding or changing any UI, verify it at mobile (~375px), tablet (~768px), and desktop (~1440px) — e.g. via the Chrome-headless `--window-size` workflow above.

- **Navigation is single-sourced** in `src/nav.ts` (`navItems`) — consumed by `Sidebar`, `Topbar`, and the routes in `App.tsx`. Add a page by adding a nav item + a route + a `pages/*.tsx`.
- **Layout & collapsible sidebar**: `components/Layout.tsx` owns the `sidebarOpen` state; the `Topbar` hamburger toggles it. The `Sidebar` collapses **out of flow on desktop** (content reflows full-width via `lg:hidden`) and becomes an **overlay drawer with backdrop on mobile** (`fixed` + `translate-x`, `lg:static`). Default open ≥1024px, closed below. Keep `components/` for layout/UI only (Layout, Sidebar, Topbar, ui, TransactionsTable, BudgetList) — **charts do not live here**.
- **Pages** (`src/pages/`): Overview, Contas (+ `ContaDetalhe` at `/contas/:id`), Transacoes, Categorias, Orcamento, Projecoes, Alertas, Privacidade ("Gestão do Consentimento") — these map to the planned analytics/account/transaction/budget/projection/consent/privacy microservices.
- **Mock data** lives in `src/data/mock.ts`, shaped to mirror those services. Heatmaps/scatter use a **deterministic PRNG** (`rng()`) so renders are stable.
- **Charts are modular in `src/charts/` — this is the project standard.** Every chart is a thematic module re-exported through a barrel `index.ts`; **pages import only from `'../charts'`** (e.g. `import { CategoryDonut, FluxoSankey } from '../charts'`), never from individual modules or from `components/`. Modules: `shared.tsx` (the shared primitives — `ResponsiveWrap`, `MiniTooltip`/`DarkTooltip`, `fmtMes`, `rampEmber`), `basics.tsx`, `timeseries.tsx`, `donuts.tsx`, `treemap.tsx`, `sankey.tsx`, `gauge.tsx`, `waterfall.tsx`, `heatmaps.tsx`, `statistical.tsx` (scatter/radar/box plot), `conta.tsx` (per-account, **props-driven**). **To add a chart**: drop it in the matching theme module (or add a new theme file + one `export *` line to `index.ts`) and reuse the helpers from `shared.tsx` instead of re-rolling tooltips/wrappers. ~16 advanced charts total (donut, area, composed, custom waterfall via stacked bars with transparent base, treemap, sunburst, CSS-grid heatmaps, bubble, radar, custom-SVG box plot & gauge, scatter, sankey).

### Brand / color rules (don't break these)
- Charts use **Recharts directly, not Tremor's chart components**, because Tremor's `colors` prop only takes Tailwind color *names*, and the brand needs exact HEX. Chart colors come from `src/theme/tokens.ts` (`palette`, `chartColors`, `axisStyle`), which mirrors `Branding/PaletaDeCores.md` — keep them in sync.
- **Double-Red rule**: brand crimson `#C1121F` ≠ loss red `#E5484D`. Use `palette.gain`/`palette.loss` for financial up/down; reserve crimson/ember for brand and primary actions only.
- `src/theme/tokens.ts` also provides BR formatters (`brl`, `brlCompact`, `pct`) and `niceAxis()` for rounded axis ticks — use these rather than re-rolling currency/axis formatting.
- `tailwind.config.js` is **ESM** (`"type": "module"` in package.json) — use `import`, not `require`, for plugins.
