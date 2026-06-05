-- consent-service · banco próprio `consent_db` (database-per-service).
-- Read-model: consentimentos Open Finance (JSONB) por usuário. Idempotente.

CREATE TABLE IF NOT EXISTS consent_read_model (
    user_id    uuid        PRIMARY KEY,
    payload    jsonb       NOT NULL,                 -- []Consentimento serializado
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================ NOTAS DE SEGURANÇA ============================
-- 1. Isolamento por usuário (PK + RLS recomendado).
-- 2. Menor privilégio: GRANT SELECT à API; escrita só ao serviço de consentimento.
-- 3. Sem PII sensível: instituição/escopos/status/datas — sem credenciais nem
--    tokens de Open Finance (esses ficam cifrados em store próprio).
-- 4. TLS obrigatório; segredos via Secrets Manager.
