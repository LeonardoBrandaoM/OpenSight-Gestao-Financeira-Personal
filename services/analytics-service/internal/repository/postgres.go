package repository

import (
	"context"
	"database/sql"
	"encoding/json"

	"opensight/services/analytics-service/internal/domain"
)

// PostgresRepo lê os read-models precomputados de analytics_db: um registro por
// usuário com três colunas JSONB (overview, insights, anomalies), atualizadas
// pelo job de precompute. Queries parametrizadas, escopadas por user_id.
type PostgresRepo struct {
	db *sql.DB
}

func NewPostgresRepo(db *sql.DB) *PostgresRepo { return &PostgresRepo{db: db} }

func loadCol[T any](ctx context.Context, db *sql.DB, col, userID string) (T, error) {
	var out T
	var raw []byte
	// `col` é constante de código (overview|insights|anomalies); user_id é $1.
	err := db.QueryRowContext(ctx,
		`SELECT `+col+` FROM analytics_read_model WHERE user_id = $1`, userID).Scan(&raw)
	if err == sql.ErrNoRows || len(raw) == 0 {
		return out, nil
	}
	if err != nil {
		return out, err
	}
	if err := json.Unmarshal(raw, &out); err != nil {
		return out, err
	}
	return out, nil
}

func (r *PostgresRepo) Overview(ctx context.Context, userID string) (domain.Overview, error) {
	return loadCol[domain.Overview](ctx, r.db, "overview", userID)
}

func (r *PostgresRepo) CategoryInsights(ctx context.Context, userID string) (domain.CategoryInsights, error) {
	return loadCol[domain.CategoryInsights](ctx, r.db, "insights", userID)
}

func (r *PostgresRepo) Anomalies(ctx context.Context, userID string) ([]domain.Anomalia, error) {
	return loadCol[[]domain.Anomalia](ctx, r.db, "anomalies", userID)
}
