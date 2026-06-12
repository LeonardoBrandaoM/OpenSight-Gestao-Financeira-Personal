-- notification-service · banco próprio `notification_db` (database-per-service).
-- Read-model: feed de alertas (JSONB) por usuário. Idempotente.

CREATE TABLE IF NOT EXISTS notifications_read_model (
    user_id    uuid        PRIMARY KEY,
    payload    jsonb       NOT NULL,                 -- []Alerta serializado
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================ NOTAS DE SEGURANÇA ============================
-- 1. Isolamento por usuário (PK + RLS recomendado).
-- 2. Menor privilégio: GRANT SELECT à API; escrita só ao gerador de alertas.
-- 3. Sem PII: títulos/detalhes de alerta agregados, sem valores brutos sensíveis.
-- 4. TLS obrigatório; segredos via Secrets Manager.
