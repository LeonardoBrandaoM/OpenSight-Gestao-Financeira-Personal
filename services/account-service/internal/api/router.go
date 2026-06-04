package api

import (
	"net/http"

	"opensight/services/account-service/internal/config"
	"opensight/services/account-service/internal/httpx"
	"opensight/services/account-service/internal/repository"
)

// NewRouter monta o roteador com a cadeia de middlewares de segurança.
// Frontend → ESTA API → repositório → DB. O navegador nunca toca no banco.
func NewRouter(repo repository.AccountRepository, cfg config.Config) http.Handler {
	h := NewHandlers(repo)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", h.health)
	mux.HandleFunc("GET /api/v1/accounts", h.listAccounts)
	mux.HandleFunc("GET /api/v1/accounts/{id}", h.getAccount)

	// Ordem: recover (mais externo) → log → security headers → CORS → auth → mux.
	return httpx.Chain(mux,
		httpx.Recoverer,
		httpx.RequestLogger,
		httpx.SecurityHeaders,
		httpx.CORS(cfg.CORSOrigins),
		WithUser,
	)
}
