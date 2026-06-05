package api

import (
	"net/http"

	"opensight/services/auth-service/internal/config"
	"opensight/services/auth-service/internal/httpx"
	"opensight/services/auth-service/internal/repository"
	"opensight/services/auth-service/internal/token"
)

func NewRouter(users repository.UserRepository, signer *token.Signer, cfg config.Config) http.Handler {
	h := NewHandlers(users, signer)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", h.health)
	mux.HandleFunc("POST /api/v1/auth/register", h.register)
	mux.HandleFunc("POST /api/v1/auth/login", h.login)
	mux.HandleFunc("GET /api/v1/auth/me", h.me)
	mux.HandleFunc("GET /api/v1/auth/public-key", h.publicKey)

	return httpx.Chain(mux,
		httpx.Recoverer,
		httpx.RequestLogger,
		httpx.SecurityHeaders,
		httpx.CORS(cfg.CORSOrigins),
	)
}
