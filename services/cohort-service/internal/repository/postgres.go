package repository

import (
	"context"
	"database/sql"

	"opensight/packages/httpkit"
	"opensight/services/cohort-service/internal/domain"
)

// PostgresRepo lê o read-model precomputado (JSONB por user_id) de cohort_db.
// A coorte é agregada/anonimizada (k-anonimato, RNF-013) — sem PII individual.
type PostgresRepo struct {
	db *sql.DB
}

func NewPostgresRepo(db *sql.DB) *PostgresRepo { return &PostgresRepo{db: db} }

const readModelTable = "cohort_read_model"

func (r *PostgresRepo) Overview(ctx context.Context, userID string) (domain.Cohort, error) {
	return httpkit.LoadReadModel[domain.Cohort](ctx, r.db, readModelTable, userID)
}
