package repository

import (
	"context"
	"database/sql"

	"opensight/packages/httpkit"
	"opensight/services/consent-service/internal/domain"
)

// PostgresRepo lê o read-model precomputado (JSONB por user_id) de consent_db.
type PostgresRepo struct {
	db *sql.DB
}

func NewPostgresRepo(db *sql.DB) *PostgresRepo { return &PostgresRepo{db: db} }

const readModelTable = "consent_read_model"

func (r *PostgresRepo) List(ctx context.Context, userID string) ([]domain.Consentimento, error) {
	return httpkit.LoadReadModel[[]domain.Consentimento](ctx, r.db, readModelTable, userID)
}
