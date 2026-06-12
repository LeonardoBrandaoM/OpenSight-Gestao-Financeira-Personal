package repository

import (
	"context"
	"database/sql"
	"strings"

	"opensight/services/auth-service/internal/domain"
)

// PostgresRepo — driver injetado no main (pgx/v5/stdlib). Queries parametrizadas.
type PostgresRepo struct{ db *sql.DB }

func NewPostgresRepo(db *sql.DB) *PostgresRepo { return &PostgresRepo{db: db} }

func (r *PostgresRepo) Create(ctx context.Context, u domain.User) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)`,
		u.ID, domain.NormalizeEmail(u.Email), u.PasswordHash)
	if err != nil && isUniqueViolation(err) {
		return domain.ErrEmailTaken
	}
	return err
}

func (r *PostgresRepo) GetByEmail(ctx context.Context, email string) (domain.User, error) {
	var u domain.User
	err := r.db.QueryRowContext(ctx,
		`SELECT id, email, password_hash, created_at FROM users WHERE email = $1`,
		domain.NormalizeEmail(email)).
		Scan(&u.ID, &u.Email, &u.PasswordHash, &u.CreatedAt)
	if err == sql.ErrNoRows {
		return domain.User{}, domain.ErrNotFound
	}
	return u, err
}

// isUniqueViolation detecta o código SQLSTATE 23505 (unique_violation) sem
// depender de tipos específicos do driver.
func isUniqueViolation(err error) bool {
	return strings.Contains(err.Error(), "23505") || strings.Contains(strings.ToLower(err.Error()), "duplicate key")
}
