package sync

import (
	"context"
	"database/sql"

	"opensight/packages/contracts"
)

// PostgresPersister grava o canônico nos bancos dos serviços (database-per-service:
// account_db e transaction_db, conexões separadas). Upserts PARAMETRIZADOS e
// idempotentes (ON CONFLICT por id). O driver pgx é registrado no main.
//
// Nota de arquitetura: escrever direto nos DBs de outros serviços é um atalho de
// MVP; o alvo é o conector publicar eventos e cada serviço gravar o seu próprio
// banco. A interface Persister mantém essa troca barata.
type PostgresPersister struct {
	accountsDB *sql.DB
	txDB       *sql.DB
}

func NewPostgresPersister(accountsDB, txDB *sql.DB) *PostgresPersister {
	return &PostgresPersister{accountsDB: accountsDB, txDB: txDB}
}

func (p *PostgresPersister) UpsertAccounts(ctx context.Context, accounts []contracts.Account) error {
	const q = `
		INSERT INTO accounts (id, user_id, institution, type, nickname, balance_cents, currency, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, now())
		ON CONFLICT (id) DO UPDATE SET
			institution   = EXCLUDED.institution,
			type          = EXCLUDED.type,
			nickname      = EXCLUDED.nickname,
			balance_cents = EXCLUDED.balance_cents,
			currency      = EXCLUDED.currency,
			updated_at    = now()`
	for _, a := range accounts {
		if _, err := p.accountsDB.ExecContext(ctx, q,
			a.ID, a.UserID, a.Institution, string(a.Type), a.Nickname, a.BalanceCents, a.Currency); err != nil {
			return err
		}
	}
	return nil
}

func (p *PostgresPersister) UpsertTransactions(ctx context.Context, txs []contracts.Transaction) error {
	const q = `
		INSERT INTO transactions (id, user_id, account_id, tx_date, description, amount_cents, currency, category, type, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		ON CONFLICT (id) DO UPDATE SET
			amount_cents = EXCLUDED.amount_cents,
			description  = EXCLUDED.description,
			category     = EXCLUDED.category,
			status       = EXCLUDED.status`
	for _, t := range txs {
		if _, err := p.txDB.ExecContext(ctx, q,
			t.ID, t.UserID, t.AccountID, t.Date, t.Description, t.AmountCents, t.Currency, t.Category, string(t.Type), t.Status); err != nil {
			return err
		}
	}
	return nil
}
