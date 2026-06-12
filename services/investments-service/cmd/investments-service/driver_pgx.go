package main

// Registra o driver "pgx" para database/sql, usado por httpkit.OpenDB quando
// DATABASE_URL está definido. Isolado para manter o driver fora do domínio.
import _ "github.com/jackc/pgx/v5/stdlib"
