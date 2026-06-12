package api

import (
	"crypto/rsa"
	"net/http"

	"opensight/services/transaction-service/internal/config"
	"opensight/services/transaction-service/internal/httpx"
	"opensight/services/transaction-service/internal/repository"
)

// NewRouter — Frontend → ESTA API → repositório → DB. `authPub` nil = modo dev.
func NewRouter(repo repository.TransactionRepository, cfg config.Config, authPub *rsa.PublicKey) http.Handler {
	h := NewHandlers(repo)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", h.health)
	mux.HandleFunc("GET /api/v1/transactions", h.listTransactions)

	return httpx.Chain(mux,
		httpx.Recoverer,
		httpx.RequestLogger,
		httpx.SecurityHeaders,
		httpx.CORS(cfg.CORSOrigins),
		Authn(authPub, cfg.AuthIssuer),
	)
}
