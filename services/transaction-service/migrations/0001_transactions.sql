-- transaction-service · banco próprio `transaction_db` (database-per-service, §5.1).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS transactions (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid        NOT NULL,
    account_id   text        NOT NULL,
    tx_date      text        NOT NULL,                 -- ISO8601 (string canônica do contrato)
    description  text        NOT NULL,
    amount_cents bigint      NOT NULL,                 -- negativo = saída; centavos (inteiro)
    currency     char(3)     NOT NULL DEFAULT 'BRL',
    category     text        NOT NULL DEFAULT 'Outros',
    type         text        NOT NULL CHECK (type IN ('DEBIT','CREDIT')),
    status       text        NOT NULL DEFAULT 'POSTED' CHECK (status IN ('PENDING','POSTED')),
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_tx_user_account ON transactions (user_id, account_id);

-- ============================ NOTAS DE SEGURANÇA ============================
-- 1. Deduplicação (RN-005): no sync, hash de (instituição+data+valor+descrição)
--    para evitar duplicatas — UNIQUE a ser adicionado quando o sync existir.
-- 2. PII: `description` pode conter nomes; trate como sensível (mascarar/cifrar
--    conforme política) e nunca logue o conteúdo.
-- 3. Isolamento por usuário (toda query filtra user_id) + RLS recomendado.
-- 4. Menor privilégio: role da app sem DDL (SELECT/INSERT/UPDATE conforme uso).
