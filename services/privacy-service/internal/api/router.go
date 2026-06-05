package api

import (
	"crypto/rsa"
	"encoding/json"
	"net/http"

	"opensight/packages/httpkit"
	"opensight/services/privacy-service/internal/domain"
	"opensight/services/privacy-service/internal/repository"
)

func NewRouter(repo repository.PrivacyRepository, cfg httpkit.Config, authPub *rsa.PublicKey) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		httpkit.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	mux.HandleFunc("GET /api/v1/privacy/requests", func(w http.ResponseWriter, r *http.Request) {
		list, err := repo.List(r.Context(), httpkit.UserID(r.Context()))
		if err != nil {
			httpkit.Error(w, http.StatusInternalServerError, "internal", "falha ao listar solicitações")
			return
		}
		if list == nil {
			list = []domain.Solicitacao{}
		}
		httpkit.JSON(w, http.StatusOK, map[string]any{"results": list})
	})

	mux.HandleFunc("POST /api/v1/privacy/requests", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Tipo domain.TipoSolicitacao `json:"tipo"`
		}
		if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 4096)).Decode(&body); err != nil {
			httpkit.Error(w, http.StatusBadRequest, "bad_request", "corpo inválido")
			return
		}
		if err := body.Tipo.Valida(); err != nil {
			httpkit.Error(w, http.StatusBadRequest, "bad_request", err.Error())
			return
		}
		s, err := repo.Create(r.Context(), httpkit.UserID(r.Context()), body.Tipo)
		if err != nil {
			httpkit.Error(w, http.StatusInternalServerError, "internal", "falha ao registrar solicitação")
			return
		}
		httpkit.JSON(w, http.StatusAccepted, s)
	})

	return httpkit.Chain(mux,
		httpkit.Recoverer,
		httpkit.RequestLogger,
		httpkit.SecurityHeaders,
		httpkit.CORS(cfg.CORSOrigins),
		httpkit.Authn(authPub, cfg.AuthIssuer),
	)
}
