-- auth-service · banco próprio `auth_db` (database-per-service, §5.1).

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()

CREATE TABLE IF NOT EXISTS users (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    email         text        NOT NULL UNIQUE,   -- normalizado em minúsculas pela aplicação
    password_hash text        NOT NULL,          -- bcrypt (custo 12) — NUNCA senha em texto puro
    created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================ NOTAS DE SEGURANÇA ============================
-- 1. Senha: apenas o HASH bcrypt é armazenado; o texto puro nunca toca o banco
--    nem os logs.
-- 2. Email: a aplicação normaliza (minúsculas/trim) antes de gravar; UNIQUE
--    garante unicidade.
-- 3. Menor privilégio: a aplicação conecta com role sem DDL:
--      GRANT SELECT, INSERT ON users TO auth_app;  -- sem DELETE/UPDATE/DDL
-- 4. TLS obrigatório (sslmode=require) e credenciais via Secrets Manager (prod).
