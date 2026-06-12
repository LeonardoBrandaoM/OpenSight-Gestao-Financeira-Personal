// Package config carrega a configuração do auth-service do ambiente/.env.
package config

import (
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string        // vazio = repositório em memória (dev)
	CORSOrigins []string      // allowlist do navegador
	JWTPrivPEM  string        // chave privada RSA (PEM); vazio = gera efêmera (dev)
	JWTIssuer   string        // claim iss
	AccessTTL   time.Duration // validade do access token
}

func Load() Config {
	_ = godotenv.Load()
	return Config{
		Port:        getenv("PORT", "8082"),
		DatabaseURL: os.Getenv("DATABASE_URL"),
		CORSOrigins: splitCSV(getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174")),
		JWTPrivPEM:  loadKey(),
		JWTIssuer:   getenv("JWT_ISSUER", "opensight-auth"),
		AccessTTL:   15 * time.Minute, // access token curto (§4.1)
	}
}

// loadKey lê a chave do conteúdo PEM (JWT_PRIVATE_KEY) ou de um arquivo
// (JWT_PRIVATE_KEY_FILE). Vazio => o signer gera uma chave efêmera de dev.
func loadKey() string {
	if pem := os.Getenv("JWT_PRIVATE_KEY"); pem != "" {
		return pem
	}
	if path := os.Getenv("JWT_PRIVATE_KEY_FILE"); path != "" {
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
