package api

import (
	"crypto/rsa"
	"net/http"

	"opensight/services/analytics-service/internal/config"
	"opensight/services/analytics-service/internal/httpx"
	"opensight/services/analytics-service/internal/repository"
)

func NewRouter(repo repository.AnalyticsRepository, cfg config.Config, authPub *rsa.PublicKey) http.Handler {
	h := NewHandlers(repo)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", h.health)
	mux.HandleFunc("GET /api/v1/analytics/overview", h.overview)

	return httpx.Chain(mux,
		httpx.Recoverer,
		httpx.RequestLogger,
		httpx.SecurityHeaders,
		httpx.CORS(cfg.CORSOrigins),
		Authn(authPub, cfg.AuthIssuer),
	)
}
