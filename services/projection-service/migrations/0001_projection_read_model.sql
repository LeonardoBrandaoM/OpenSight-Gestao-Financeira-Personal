-- projection-service · banco próprio `projection_db` (database-per-service).
-- Read-model precomputado: cenários de projeção (JSONB) por usuário. Idempotente.

CREATE TABLE IF NOT EXISTS projection_read_model (
    user_id    uuid        PRIMARY KEY,
    payload    jsonb       NOT NULL,                 -- []Cenario serializado
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================ NOTAS DE SEGURANÇA ============================
-- 1. Isolamento por usuário (PK + RLS recomendado, igual aos demais serviços).
-- 2. Menor privilégio: GRANT SELECT à API; INSERT/UPDATE só ao job de precompute.
-- 3. Sem PII: apenas séries/valores agregados de projeção.
-- 4. TLS obrigatório; segredos via Secrets Manager.
