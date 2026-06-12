package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"opensight/services/audit-service/internal/domain"
)

// PostgresRepo persiste a trilha de auditoria em audit_db. Append-only: apenas
// INSERT e SELECT (sem UPDATE/DELETE). Queries parametrizadas, escopadas por user_id.
type PostgresRepo struct {
	db *sql.DB
}

func NewPostgresRepo(db *sql.DB) *PostgresRepo { return &PostgresRepo{db: db} }

func (r *PostgresRepo) List(ctx context.Context, userID string) ([]domain.Evento, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, acao, recurso, resultado, origem, em FROM audit_events WHERE user_id = $1 ORDER BY id`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []domain.Evento
	for rows.Next() {
		var id int64
		var acao, recurso, resultado, origem string
		var em time.Time
		if err := rows.Scan(&id, &acao, &recurso, &resultado, &origem, &em); err != nil {
			return nil, err
		}
		out = append(out, domain.Evento{
			ID:        fmt.Sprintf("evt-%d", id),
			Acao:      acao,
			Recurso:   recurso,
			Resultado: resultado,
			Origem:    origem,
			Em:        em.UTC().Format(time.RFC3339),
		})
	}
	return out, rows.Err()
}

func (r *PostgresRepo) Append(ctx context.Context, userID string, n domain.NovoEvento) (domain.Evento, error) {
	var id int64
	var em time.Time
	err := r.db.QueryRowContext(ctx,
		`INSERT INTO audit_events (user_id, acao, recurso, resultado, origem)
		 VALUES ($1, $2, $3, $4, $5) RETURNING id, em`,
		userID, n.Acao, n.Recurso, n.Resultado, n.Origem).Scan(&id, &em)
	if err != nil {
		return domain.Evento{}, err
	}
	return domain.Evento{
		ID:        fmt.Sprintf("evt-%d", id),
		Acao:      n.Acao,
		Recurso:   n.Recurso,
		Resultado: n.Resultado,
		Origem:    n.Origem,
		Em:        em.UTC().Format(time.RFC3339),
	}, nil
}
