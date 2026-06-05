# auth-service

Autenticação do OpenSight: cadastro/login e emissão de **JWT RS256**
(ArquiteturaOpenSight.md §3.1). Porta padrão **:8082**.

## Segurança
- Senhas com **bcrypt (custo 12)**; apenas o hash é persistido (nunca texto puro).
- Política de senha mínima de 12 caracteres (SRS RF-001); email normalizado e único.
- Login sempre responde com mensagem genérica (não revela se o email existe).
- Access token **RS256**, validade 15 min, claims `sub`/`iss`/`iat`/`exp`.
- Corpo de request limitado (1MB) + `DisallowUnknownFields`; CORS allowlist;
  security headers; logs sem PII.

## Endpoints
- `GET  /healthz`
- `POST /api/v1/auth/register`  body `{ email, password }` → 201 `{ id, email }`
- `POST /api/v1/auth/login`     body `{ email, password }` → 200 `{ accessToken, tokenType, expiresAt }`
- `GET  /api/v1/auth/me`        header `Authorization: Bearer <jwt>` → 200 `{ userId }`
- `GET  /api/v1/auth/public-key` → `{ alg, publicKeyPem }` (outros serviços validam o JWT com isto)

## Rodar (dev)
```bash
cd services/auth-service
go run ./cmd/auth-service          # repo em memória + chave JWT efêmera (dev)
```
Para chave estável: `openssl genrsa -out jwt_private.pem 2048` e
`JWT_PRIVATE_KEY_FILE=./jwt_private.pem`. Postgres: aplicar `migrations/0001_users.sql`
e definir `DATABASE_URL`.

## Integração com o account-service
Pegue a chave pública (`/api/v1/auth/public-key`) e configure
`AUTH_PUBLIC_KEY`/`AUTH_PUBLIC_KEY_FILE` no account-service → o JWT passa a ser
exigido lá. Em produção, ambas as chaves vêm do AWS Secrets Manager (§4.3).
