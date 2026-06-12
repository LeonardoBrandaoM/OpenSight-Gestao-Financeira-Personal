package httpkit

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"
)

// OpenDB abre e valida um pool Postgres. O driver é registrado por um blank
// import no main do serviço (ex.: _ "github.com/jackc/pgx/v5/stdlib"); aqui
// usamos o nome "pgx". Limites conservadores e ping com timeout. Em produção a
// URL deve usar TLS (sslmode=require) e vir do Secrets Manager, nunca do código.
func OpenDB(ctx context.Context, url string) (*sql.DB, error) {
	db, err := sql.Open("pgx", url)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)

	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := db.PingContext(pingCtx); err != nil {
		_ = db.Close()
		return nil, err
	}
	return db, nil
}

// LoadReadModel lê o read-model precomputado de um usuário: um único registro
// JSONB por user_id. `table` é SEMPRE uma constante de código do serviço (nunca
// input do usuário) — seguro interpolar; user_id é parametrizado ($1). Se não
// houver linha, retorna o zero-value de T e nil (sem dados ainda).
func LoadReadModel[T any](ctx context.Context, db *sql.DB, table, userID string) (T, error) {
	var out T
	var raw []byte
	err := db.QueryRowContext(ctx, `SELECT payload FROM `+table+` WHERE user_id = $1`, userID).Scan(&raw)
	if err == sql.ErrNoRows {
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
