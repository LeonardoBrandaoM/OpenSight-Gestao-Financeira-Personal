# budget-service

Metas orçamentárias, sugestões e comprometimento (ArquiteturaOpenSight.md §3.9).
Porta **:8085**. Usa `packages/httpkit` (respostas, middlewares, JWT).

- `GET /healthz`
- `GET /api/v1/budget/overview` → `{ metas, sugestoes, gastoPorCategoria, comprometimento }`

Hoje serve seed em memória; persistência em `budget_db` + cálculo a partir das
transações são o próximo passo. `go run ./cmd/budget-service`.
