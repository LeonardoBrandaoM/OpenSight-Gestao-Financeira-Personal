package main

// Registra o driver "pgx" para database/sql, usado por internal/platform.OpenDB
// quando DATABASE_URL está definido. Isolado em arquivo próprio para manter a
// dependência do driver fora do código de domínio/repositório.
import _ "github.com/jackc/pgx/v5/stdlib"
