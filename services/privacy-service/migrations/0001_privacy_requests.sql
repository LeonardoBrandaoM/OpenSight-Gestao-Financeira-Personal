-- privacy-service · banco próprio `privacy_db` (database-per-service).
-- Solicitações de direitos do titular LGPD (portabilidade/eliminação). Idempotente.

CREATE TABLE IF NOT EXISTS privacy_requests (
    id         bigserial   PRIMARY KEY,
    user_id    uuid        NOT NULL,
    tipo       text        NOT NULL CHECK (tipo IN ('export','delete')),
    status     text        NOT NULL DEFAULT 'pendente'
                           CHECK (status IN ('pendente','processando','concluido')),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_privacy_requests_user ON privacy_requests (user_id);

-- ============================ NOTAS DE SEGURANÇA ============================
-- 1. Isolamento por usuário: toda query filtra por user_id (RLS recomendado).
-- 2. Menor privilégio: GRANT SELECT, INSERT, UPDATE ON privacy_requests (sem
--    DELETE — a baixa é por status, preservando trilha do pedido).
-- 3. Sem PII no registro do pedido: apenas tipo/status/datas. A execução do
--    direito (export/delete) ocorre em cascata nos demais serviços (SLA 72h).
-- 4. TLS obrigatório; segredos via Secrets Manager.
