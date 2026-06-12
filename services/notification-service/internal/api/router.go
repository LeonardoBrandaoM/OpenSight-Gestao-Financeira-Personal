package api

import (
	"crypto/rsa"
	"net/http"

	"opensight/packages/httpkit"
	"opensight/services/notification-service/internal/domain"
	"opensight/services/notification-service/internal/repository"
)

func NewRouter(repo repository.NotificationRepository, cfg httpkit.Config, authPub *rsa.PublicKey) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		httpkit.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	mux.HandleFunc("GET /api/v1/notifications", func(w http.ResponseWriter, r *http.Request) {
		list, err := repo.List(r.Context(), httpkit.UserID(r.Context()))
		if err != nil {
			httpkit.Error(w, http.StatusInternalServerError, "internal", "falha ao listar notificações")
			return
		}
		if list == nil {
			list = []domain.Alerta{}
		}
		httpkit.JSON(w, http.StatusOK, map[string]any{"results": list})
	})

	return httpkit.Chain(mux,
		httpkit.Recoverer,
		httpkit.RequestLogger,
		httpkit.SecurityHeaders,
		httpkit.CORS(cfg.CORSOrigins),
		httpkit.Authn(authPub, cfg.AuthIssuer),
	)
}
