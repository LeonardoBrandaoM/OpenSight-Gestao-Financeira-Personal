-- account-service · histórico de saldo por conta (account_db).
-- Alimentado pelo sync (snapshots periódicos); valores em centavos.

CREATE TABLE IF NOT EXISTS balance_history (
    user_id     uuid   NOT NULL,
    account_id  uuid   NOT NULL,
    seq         int    NOT NULL,            -- ordem cronológica (0 = mais antigo)
    mes         text   NOT NULL,            -- rótulo do período (ex.: 'Mai')
    saldo_cents bigint NOT NULL,
    PRIMARY KEY (account_id, seq)
);

CREATE INDEX IF NOT EXISTS idx_balance_history_user_acct ON balance_history (user_id, account_id);

-- Segurança: mesmas regras da tabela accounts (isolamento por user_id, RLS
-- recomendado, role de menor privilégio).
