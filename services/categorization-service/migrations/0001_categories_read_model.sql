-- categorization-service · banco próprio `categorization_db` (database-per-service).
-- Read-model: categorias/tipos + breakdown (JSONB) por usuário. Idempotente.

CREATE TABLE IF NOT EXISTS categories_read_model (
    user_id    uuid        PRIMARY KEY,
    payload    jsonb       NOT NULL,                 -- CategoriesOverview serializado
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================ NOTAS DE SEGURANÇA ============================
-- 1. Isolamento por usuário (PK + RLS recomendado).
-- 2. Menor privilégio: GRANT SELECT à API; escrita só ao serviço de categorização.
-- 3. Sem PII: cadastro de categorias/tipos e agregados por categoria.
-- 4. TLS obrigatório; segredos via Secrets Manager.
