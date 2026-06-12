package api

import (
	"crypto/rsa"
	"net/http"

	"opensight/packages/httpkit"
	"opensight/services/budget-service/internal/config"
	"opensight/services/budget-service/internal/repository"
)

func NewRouter(repo repository.BudgetRepository, cfg config.Config, authPub *rsa.PublicKey) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		httpkit.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	mux.HandleFunc("GET /api/v1/budget/overview", func(w http.ResponseWriter, r *http.Request) {
		ov, err := repo.Overview(r.Context(), httpkit.UserID(r.Context()))
		if err != nil {
			httpkit.Error(w, http.StatusInternalServerError, "internal", "falha ao carregar orçamento")
			return
		}
		httpkit.JSON(w, http.StatusOK, ov)
	})

	return httpkit.Chain(mux,
		httpkit.Recoverer,
		httpkit.RequestLogger,
		httpkit.SecurityHeaders,
		httpkit.CORS(cfg.CORSOrigins),
		httpkit.Authn(authPub, cfg.AuthIssuer),
	)
}
