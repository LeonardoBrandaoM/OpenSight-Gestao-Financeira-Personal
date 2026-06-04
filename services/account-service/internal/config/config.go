// Package config carrega a configuração do serviço a partir do ambiente/.env.
// Segredos NUNCA ficam no código; em produção vêm do AWS Secrets Manager (§4.3).
package config

import (
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port         string        // porta HTTP
	DatabaseURL  string        // DSN Postgres; vazio = usa repositório em memória (dev)
	CORSOrigins  []string      // origens permitidas (allowlist) para o navegador
	ReadTimeout  time.Duration // timeout de leitura do servidor
	WriteTimeout time.Duration
}

func Load() Config {
	_ = godotenv.Load()
	return Config{
		Port:         getenv("PORT", "8081"),
		DatabaseURL:  os.Getenv("DATABASE_URL"),
		CORSOrigins:  splitCSV(getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174")),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
	}
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func splitCSV(s string) []string {
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			out = append(out, t)
		}
	}
	return out
}
