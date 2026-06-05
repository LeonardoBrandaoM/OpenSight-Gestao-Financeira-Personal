-- budget-service · banco próprio `budget_db` (database-per-service, §5.1).
-- Read-model precomputado: um registro JSONB por usuário, atualizado por um job
-- de precompute (CQRS). Aplicar com golang-migrate. Idempotente.

CREATE TABLE IF NOT EXISTS budget_read_model (
    user_id    uuid        PRIMARY KEY,
    payload    jsonb       NOT NULL,                 -- BudgetOverview serializado
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================ NOTAS DE SEGURANÇA ============================
-- 1. Isolamento por usuário: toda query filtra por user_id (PK). RLS recomendado:
--      ALTER TABLE budget_read_model ENABLE ROW LEVEL SECURITY;
--      CREATE POLICY iso ON budget_read_model
--        USING (user_id = current_setting('app.user_id')::uuid);
-- 2. Menor privilégio: a API conecta com role sem DDL.
--      GRANT SELECT ON budget_read_model TO budget_app;          -- leitura (API)
--      GRANT INSERT, UPDATE ON budget_read_model TO budget_precompute; -- job
-- 3. Sem PII: o read-model guarda apenas agregados (metas/percentuais), nunca
--    número de conta, documento ou tokens.
-- 4. Conexão sempre via TLS (sslmode=require); segredos via Secrets Manager.
