-- investments-service · banco próprio `investments_db` (database-per-service).
-- Read-model: carteira de investimentos (JSONB) por usuário. Idempotente.

CREATE TABLE IF NOT EXISTS investments_read_model (
    user_id    uuid        PRIMARY KEY,
    payload    jsonb       NOT NULL,                 -- InvestmentsOverview serializado
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================ NOTAS DE SEGURANÇA ============================
-- 1. Isolamento por usuário (PK + RLS recomendado).
-- 2. Menor privilégio: GRANT SELECT à API; escrita só ao job de precompute.
-- 3. Sem PII de corretora: apenas posições/agregados. READ-ONLY de negócio.
-- 4. TLS obrigatório; segredos via Secrets Manager.
