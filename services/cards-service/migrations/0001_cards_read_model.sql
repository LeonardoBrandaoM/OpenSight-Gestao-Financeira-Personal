-- cards-service · banco próprio `cards_db` (database-per-service).
-- Read-model: visão de cartões (JSONB) por usuário. Idempotente.

CREATE TABLE IF NOT EXISTS cards_read_model (
    user_id    uuid        PRIMARY KEY,
    payload    jsonb       NOT NULL,                 -- CardsOverview serializado
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================ NOTAS DE SEGURANÇA ============================
-- 1. Isolamento por usuário (PK + RLS recomendado).
-- 2. Menor privilégio: GRANT SELECT à API; escrita só ao job de precompute.
-- 3. Sem PII: número do cartão NUNCA aqui — apenas apelido mascarado e agregados.
-- 4. READ-ONLY de negócio: o OpenSight nunca paga fatura. TLS obrigatório.
