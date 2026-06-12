-- analytics-service · banco próprio `analytics_db` (database-per-service, §3.7).
-- Read-models precomputados (CQRS): um registro por usuário com as agregações do
-- dashboard e os insights/anomalias dos gráficos avançados. Idempotente.

CREATE TABLE IF NOT EXISTS analytics_read_model (
    user_id    uuid        PRIMARY KEY,
    overview   jsonb       NOT NULL DEFAULT '{}'::jsonb,  -- Overview (saldo, cashflow, categorias, resumo)
    insights   jsonb       NOT NULL DEFAULT '{}'::jsonb,  -- CategoryInsights (treemap, heatmap, bolhas...)
    anomalies  jsonb       NOT NULL DEFAULT '[]'::jsonb,  -- []Anomalia (scatter z-score)
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================ NOTAS DE SEGURANÇA ============================
-- 1. Isolamento por usuário (PK + RLS recomendado).
-- 2. Menor privilégio: GRANT SELECT à API; INSERT/UPDATE só ao job de precompute
--    (que lê transactions/accounts e materializa estes read-models).
-- 3. Sem PII: apenas agregados estatísticos, nunca transações brutas.
-- 4. TLS obrigatório; segredos via Secrets Manager.
