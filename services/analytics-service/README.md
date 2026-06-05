# analytics-service

Agregações do dashboard (ArquiteturaOpenSight.md §3.7). Porta **:8084**.

## Endpoints
- `GET /healthz`
- `GET /api/v1/analytics/overview` → `{ balanceSeries, cashflow, byCategory, resumo }`

## Notas
- Hoje serve as agregações de **seed em memória** por usuário. O alvo é um
  **pipeline de precompute** a partir das transações, gravando em `analytics_db`
  (com o invariante de anonimização para ML/coorte preservado).
- Segurança igual aos demais: `Authn` exige JWT RS256 quando `AUTH_PUBLIC_KEY`
  está setado; CORS allowlist; security headers; timeouts; graceful shutdown.

## Rodar (dev)
```bash
cd services/analytics-service && go run ./cmd/analytics-service   # :8084
```
