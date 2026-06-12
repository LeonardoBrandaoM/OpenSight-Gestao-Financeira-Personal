package repository

import (
	"context"
	"database/sql"

	"opensight/packages/contracts"
)

// PostgresRepo — driver pgx injetado no main. Queries parametrizadas, escopadas
// por user_id; filtro opcional por account_id sem concatenar input.
type PostgresRepo struct{ db *sql.DB }

func NewPostgresRepo(db *sql.DB) *PostgresRepo { return &PostgresRepo{db: db} }

const selectCols = `id, user_id, account_id, tx_date, description, amount_cents, currency, category, type, status`

func (r *PostgresRepo) List(ctx context.Context, userID, accountID string) ([]contracts.Transaction, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT `+selectCols+` FROM transactions
		 WHERE user_id = $1 AND ($2 = '' OR account_id = $2)
		 ORDER BY tx_date DESC, id`, userID, accountID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]contracts.Transaction, 0)
	for rows.Next() {
		var t contracts.Transaction
		if err := rows.Scan(&t.ID, &t.UserID, &t.AccountID, &t.Date, &t.Description,
			&t.AmountCents, &t.Currency, &t.Category, &t.Type, &t.Status); err != nil {
			return nil, err
		}
		out = append(out, t)
	}
	return out, rows.Err()
}
