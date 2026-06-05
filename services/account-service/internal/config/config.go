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
	Port             string        // porta HTTP
	DatabaseURL      string        // DSN Postgres; vazio = usa repositório em memória (dev)
	CORSOrigins      []string      // origens permitidas (allowlist) para o navegador
	AuthPublicKeyPEM string        // chave pública RSA do auth-service; vazio = modo dev (sem JWT)
	AuthIssuer       string        // issuer esperado nos JWT
	ReadTimeout      time.Duration // timeout de leitura do servidor
	WriteTimeout     time.Duration
}

func Load() Config {
	_ = godotenv.Load()
	return Config{
		Port:             getenv("PORT", "8081"),
		DatabaseURL:      os.Getenv("DATABASE_URL"),
		CORSOrigins:      splitCSV(getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174")),
		AuthPublicKeyPEM: loadAuthKey(),
		AuthIssuer:       getenv("JWT_ISSUER", "opensight-auth"),
		ReadTimeout:      10 * time.Second,
		WriteTimeout:     15 * time.Second,
	}
}

// loadAuthKey lê a chave pública do JWT via AUTH_PUBLIC_KEY (PEM) ou
// AUTH_PUBLIC_KEY_FILE. Vazio => autenticação em modo dev (sem validação).
func loadAuthKey() string {
	if pem := os.Getenv("AUTH_PUBLIC_KEY"); pem != "" {
		return pem
	}
	if path := os.Getenv("AUTH_PUBLIC_KEY_FILE"); path != "" {
		if b, err := os.ReadFile(path); err == nil {
			return string(b)
		}
	}
	return ""
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
