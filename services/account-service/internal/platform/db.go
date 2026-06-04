// Package platform contém adaptadores de infraestrutura (pool de DB).
package platform

import (
	"context"
	"database/sql"
	"time"
)

// OpenDB abre e valida um pool Postgres. O driver é registrado por um blank
// import no main (ex.: _ "github.com/jackc/pgx/v5/stdlib"); aqui usamos o nome
// "pgx". Pool com limites conservadores e ping com timeout.
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
