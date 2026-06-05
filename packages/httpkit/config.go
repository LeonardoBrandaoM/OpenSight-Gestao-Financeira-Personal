package httpkit

import (
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// Config é a configuração base comum aos serviços HTTP.
type Config struct {
	Port             string
	CORSOrigins      []string
	AuthPublicKeyPEM string // chave pública do auth-service; vazio = modo dev
	AuthIssuer       string
	DatabaseURL      string // vazio = repositório em memória (dev)
	ReadTimeout      time.Duration
	WriteTimeout     time.Duration
}

// LoadConfig lê a configuração do ambiente/.env (porta padrão por serviço).
func LoadConfig(defaultPort string) Config {
	_ = godotenv.Load()
	return Config{
		Port:             getenv("PORT", defaultPort),
		CORSOrigins:      splitCSV(getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174")),
		AuthPublicKeyPEM: loadAuthKey(),
		AuthIssuer:       getenv("JWT_ISSUER", "opensight-auth"),
		DatabaseURL:      os.Getenv("DATABASE_URL"),
		ReadTimeout:      10 * time.Second,
		WriteTimeout:     15 * time.Second,
	}
}

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
