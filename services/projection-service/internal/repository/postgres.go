package repository

import (
	"context"
	"database/sql"

	"opensight/packages/httpkit"
	"opensight/services/projection-service/internal/domain"
)

// PostgresRepo lê o read-model precomputado (JSONB por user_id) de projection_db.
type PostgresRepo struct {
	db *sql.DB
}

func NewPostgresRepo(db *sql.DB) *PostgresRepo { return &PostgresRepo{db: db} }

const readModelTable = "projection_read_model"

func (r *PostgresRepo) Scenarios(ctx context.Context, userID string) ([]domain.Cenario, error) {
	return httpkit.LoadReadModel[[]domain.Cenario](ctx, r.db, readModelTable, userID)
}
