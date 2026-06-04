# deploy/

Infra de desenvolvimento. Hoje: **Postgres** para o `account-service`.

## Subir o Postgres (dados no D:)

Pré-requisitos: **Docker Desktop rodando**. Como o **C: está cheio**, aponte o
*Disk image location* do Docker Desktop para o **D:** (Settings → Resources →
Advanced) antes de baixar a imagem.

```bash
cp deploy/.env.example deploy/.env          # ajuste POSTGRES_PASSWORD
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d
docker compose -f deploy/docker-compose.yml ps     # aguarde "healthy"
```

A migration `services/account-service/migrations/0001_accounts.sql` é aplicada
automaticamente no primeiro init (cria `account_db.accounts`).

## Ligar o account-service ao Postgres

No `services/account-service/.env`:

```
DATABASE_URL=postgres://account_app:devsecret@localhost:5432/account_db?sslmode=disable
```

(`sslmode=disable` só em dev local; em produção use `require` + Secrets Manager.)
Depois:

```bash
cd services/account-service && go run ./cmd/account-service
# loga "repositório: Postgres" em vez de "memória"
```

## Alternativa sem Docker (PostgreSQL nativo Windows)

Com o PostgreSQL 18 já instalado, crie o banco/role e aplique a migration:

```sql
CREATE DATABASE account_db;
CREATE ROLE account_app LOGIN PASSWORD 'devsecret';
GRANT ALL ON DATABASE account_db TO account_app;   -- dev; em prod, menor privilégio (ver a migration)
\c account_db
\i services/account-service/migrations/0001_accounts.sql
```
