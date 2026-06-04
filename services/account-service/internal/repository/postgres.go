package repository

import (
	"context"
	"database/sql"

	"opensight/services/account-service/internal/domain"
)

// PostgresRepo usa database/sql (driver injetado no main via blank import, ex.:
// pgx/v5/stdlib). Todas as queries usam placeholders ($1, $2) — NUNCA
// concatenação de input do usuário (proteção contra SQL injection). Sempre
// escopadas por user_id.
type PostgresRepo struct {
	db *sql.DB
}

func NewPostgresRepo(db *sql.DB) *PostgresRepo { return &PostgresRepo{db: db} }

// selectCols é uma constante de código (não recebe input) — seguro concatenar.
const selectCols = `id, user_id, institution, type, nickname, balance_cents, currency, updated_at`

func scanAccount(s interface {
	Scan(dest ...any) error
}) (domain.Account, error) {
	var a domain.Account
	err := s.Scan(&a.ID, &a.UserID, &a.Institution, &a.Type, &a.Nickname, &a.BalanceCents, &a.Currency, &a.UpdatedAt)
	return a, err
}

func (r *PostgresRepo) List(ctx context.Context, userID string) ([]domain.Account, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT `+selectCols+` FROM accounts WHERE user_id = $1 ORDER BY institution, id`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []domain.Account
	for rows.Next() {
		a, err := scanAccount(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, rows.Err()
}

func (r *PostgresRepo) Get(ctx context.Context, userID, id string) (domain.Account, error) {
	row := r.db.QueryRowContext(ctx,
		`SELECT `+selectCols+` FROM accounts WHERE user_id = $1 AND id = $2`, userID, id)
	a, err := scanAccount(row)
	if err == sql.ErrNoRows {
		return domain.Account{}, domain.ErrNotFound
	}
	return a, err
}
