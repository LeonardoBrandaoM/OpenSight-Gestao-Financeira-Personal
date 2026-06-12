-- audit-service · banco próprio `audit_db` (database-per-service).
-- Trilha de auditoria APPEND-ONLY (imutável): só INSERT e SELECT. Idempotente.

CREATE TABLE IF NOT EXISTS audit_events (
    id         bigserial   PRIMARY KEY,
    user_id    uuid        NOT NULL,
    acao       text        NOT NULL,                 -- ex.: account.read, consent.revoke
    recurso    text        NOT NULL DEFAULT '',      -- ex.: account:123
    resultado  text        NOT NULL,                 -- sucesso | negado | erro
    origem     text        NOT NULL DEFAULT '',      -- serviço emissor
    em         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_user ON audit_events (user_id, id);

-- ============================ NOTAS DE SEGURANÇA ============================
-- 1. IMUTABILIDADE: a role da aplicação recebe SOMENTE INSERT e SELECT —
--    nunca UPDATE/DELETE — garantindo trilha à prova de adulteração:
--      GRANT INSERT, SELECT ON audit_events TO audit_app;
--      GRANT USAGE, SELECT ON SEQUENCE audit_events_id_seq TO audit_app;
--    (retenção/expurgo por job privilegiado à parte, conforme política.)
-- 2. Isolamento por usuário: consultas filtram por user_id (RLS recomendado).
-- 3. Sem PII no detalhe: registrar ação/recurso/resultado, nunca valores brutos
--    sensíveis nem credenciais.
-- 4. TLS obrigatório; segredos via Secrets Manager.
