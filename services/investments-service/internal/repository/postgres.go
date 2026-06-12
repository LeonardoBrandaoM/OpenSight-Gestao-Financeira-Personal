package repository

import (
	"context"
	"database/sql"

	"opensight/packages/httpkit"
	"opensight/services/investments-service/internal/domain"
)

// PostgresRepo lê o read-model precomputado (JSONB por user_id) de investments_db.
type PostgresRepo struct {
	db *sql.DB
}

func NewPostgresRepo(db *sql.DB) *PostgresRepo { return &PostgresRepo{db: db} }

const readModelTable = "investments_read_model"

func (r *PostgresRepo) Overview(ctx context.Context, userID string) (domain.Overview, error) {
	return httpkit.LoadReadModel[domain.Overview](ctx, r.db, readModelTable, userID)
}
