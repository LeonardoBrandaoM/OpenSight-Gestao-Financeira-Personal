package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"opensight/services/privacy-service/internal/domain"
)

// PostgresRepo persiste solicitações de direitos LGPD em privacy_db. Queries
// parametrizadas ($1...), sempre escopadas por user_id.
type PostgresRepo struct {
	db *sql.DB
}

func NewPostgresRepo(db *sql.DB) *PostgresRepo { return &PostgresRepo{db: db} }

func (r *PostgresRepo) List(ctx context.Context, userID string) ([]domain.Solicitacao, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, tipo, status, created_at FROM privacy_requests WHERE user_id = $1 ORDER BY id`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []domain.Solicitacao
	for rows.Next() {
		var id int64
		var tipo, status string
		var created time.Time
		if err := rows.Scan(&id, &tipo, &status, &created); err != nil {
			return nil, err
		}
		out = append(out, domain.Solicitacao{
			ID:       fmt.Sprintf("req-%d", id),
			Tipo:     domain.TipoSolicitacao(tipo),
			Status:   status,
			CriadoEm: created.UTC().Format(time.RFC3339),
		})
	}
	return out, rows.Err()
}

func (r *PostgresRepo) Create(ctx context.Context, userID string, tipo domain.TipoSolicitacao) (domain.Solicitacao, error) {
	var id int64
	var created time.Time
	err := r.db.QueryRowContext(ctx,
		`INSERT INTO privacy_requests (user_id, tipo, status) VALUES ($1, $2, 'pendente') RETURNING id, created_at`,
		userID, string(tipo)).Scan(&id, &created)
	if err != nil {
		return domain.Solicitacao{}, err
	}
	return domain.Solicitacao{
		ID:       fmt.Sprintf("req-%d", id),
		Tipo:     tipo,
		Status:   "pendente",
		CriadoEm: created.UTC().Format(time.RFC3339),
	}, nil
}
