# transaction-service

API HTTP de transações (modelo canônico de `packages/contracts`). Porta **:8083**.
Mesmo padrão de segurança dos demais: Frontend → API → repositório → DB
(parametrizado, escopado por `user_id`); o navegador nunca executa SQL.

## Endpoints
- `GET /healthz`
- `GET /api/v1/transactions?accountId=<id>` → `{ results: [ Transaction... ] }` (filtro opcional)

## Segurança
- `Authn`: exige **JWT RS256** quando `AUTH_PUBLIC_KEY`/`_FILE` está setado; senão modo dev.
- Queries parametrizadas; CORS allowlist; security headers; logs sem PII; timeouts + graceful shutdown.

## Rodar (dev)
```bash
cd services/transaction-service
go test ./...
go run ./cmd/transaction-service   # :8083, repo em memória se não houver DATABASE_URL
```
Postgres: aplicar `migrations/0001_transactions.sql` e definir `DATABASE_URL`.

## Contratos
Usa `opensight/packages/contracts` (modelo canônico compartilhado). É também o
alvo do mapeamento do institution-connector-service (Pluggy → contracts) no sync.
