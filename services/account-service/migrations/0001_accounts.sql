-- account-service · banco próprio `account_db` (database-per-service, §5.1).
-- Aplicar com uma ferramenta de migração (ex.: golang-migrate). Idempotente.

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()

CREATE TABLE IF NOT EXISTS accounts (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid        NOT NULL,
    institution   text        NOT NULL,
    type          text        NOT NULL CHECK (type IN ('CHECKING','SAVINGS','CREDIT_CARD','INVESTMENT')),
    nickname      text        NOT NULL,                 -- mascarado (ex.: '•••• 4471')
    balance_cents bigint      NOT NULL DEFAULT 0,       -- valores monetários em centavos (inteiro)
    currency      char(3)     NOT NULL DEFAULT 'BRL',
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts (user_id);

-- ============================ NOTAS DE SEGURANÇA ============================
-- 1. PII: o NÚMERO COMPLETO da conta nunca fica aqui. Apenas `nickname`
--    mascarado. Dados sensíveis (ex.: número completo, tokens) ficam
--    criptografados (AES-256) em colunas/tabelas próprias e jamais são expostos
--    pela API.
-- 2. Isolamento por usuário: toda query filtra por user_id. Recomenda-se
--    habilitar Row-Level Security para defesa em profundidade:
--      ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
--      CREATE POLICY accounts_isolation ON accounts
--        USING (user_id = current_setting('app.user_id')::uuid);
--    (a aplicação faz SET LOCAL app.user_id ao iniciar a transação.)
-- 3. Menor privilégio: a aplicação conecta com um role SEM DDL, apenas com
--    os DML necessários:
--      CREATE ROLE account_app LOGIN PASSWORD :'pwd';
--      GRANT SELECT, INSERT, UPDATE ON accounts TO account_app;  -- sem DELETE/DDL
-- 4. Conexão sempre via TLS (sslmode=require) e credenciais fora do código
--    (Secrets Manager em prod).
