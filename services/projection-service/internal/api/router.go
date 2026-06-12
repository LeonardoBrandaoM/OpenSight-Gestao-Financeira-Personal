package api

import (
	"crypto/rsa"
	"net/http"

	"opensight/packages/httpkit"
	"opensight/services/projection-service/internal/domain"
	"opensight/services/projection-service/internal/repository"
)

func NewRouter(repo repository.ProjectionRepository, cfg httpkit.Config, authPub *rsa.PublicKey) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		httpkit.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	mux.HandleFunc("GET /api/v1/projections", func(w http.ResponseWriter, r *http.Request) {
		cenarios, err := repo.Scenarios(r.Context(), httpkit.UserID(r.Context()))
		if err != nil {
			httpkit.Error(w, http.StatusInternalServerError, "internal", "falha ao calcular projeções")
			return
		}
		if cenarios == nil {
			cenarios = []domain.Cenario{}
		}
		httpkit.JSON(w, http.StatusOK, map[string]any{"cenarios": cenarios})
	})

	return httpkit.Chain(mux,
		httpkit.Recoverer,
		httpkit.RequestLogger,
		httpkit.SecurityHeaders,
		httpkit.CORS(cfg.CORSOrigins),
		httpkit.Authn(authPub, cfg.AuthIssuer),
	)
}
