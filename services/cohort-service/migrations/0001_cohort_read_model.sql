-- cohort-service · banco próprio `cohort_db` (database-per-service).
-- Read-model: comparativo de coorte (JSONB) por usuário. Idempotente.

CREATE TABLE IF NOT EXISTS cohort_read_model (
    user_id    uuid        PRIMARY KEY,
    payload    jsonb       NOT NULL,                 -- Cohort serializado (agregado)
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================ NOTAS DE SEGURANÇA ============================
-- 1. Isolamento por usuário (PK + RLS recomendado).
-- 2. Menor privilégio: GRANT SELECT à API; escrita só ao job de coorte.
-- 3. Anonimização (RNF-013): o payload contém SOMENTE medianas/agregados da
--    coorte com k-anonimato mínimo — NUNCA dados individuais de outros usuários.
--    Entra na coorte apenas quem consentiu (opt-in); revogar remove em cascata.
-- 4. TLS obrigatório; segredos via Secrets Manager.
