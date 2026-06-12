package repository

import (
	"context"
	"database/sql"

	"opensight/packages/httpkit"
	"opensight/services/notification-service/internal/domain"
)

// PostgresRepo lê o read-model precomputado (JSONB por user_id) de notification_db.
type PostgresRepo struct {
	db *sql.DB
}

func NewPostgresRepo(db *sql.DB) *PostgresRepo { return &PostgresRepo{db: db} }

const readModelTable = "notifications_read_model"

func (r *PostgresRepo) List(ctx context.Context, userID string) ([]domain.Alerta, error) {
	return httpkit.LoadReadModel[[]domain.Alerta](ctx, r.db, readModelTable, userID)
}
