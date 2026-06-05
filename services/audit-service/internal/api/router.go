package api

import (
	"crypto/rsa"
	"encoding/json"
	"net/http"

	"opensight/packages/httpkit"
	"opensight/services/audit-service/internal/domain"
	"opensight/services/audit-service/internal/repository"
)

func NewRouter(repo repository.AuditRepository, cfg httpkit.Config, authPub *rsa.PublicKey) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		httpkit.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	mux.HandleFunc("GET /api/v1/audit/events", func(w http.ResponseWriter, r *http.Request) {
		list, err := repo.List(r.Context(), httpkit.UserID(r.Context()))
		if err != nil {
			httpkit.Error(w, http.StatusInternalServerError, "internal", "falha ao listar eventos")
			return
		}
		if list == nil {
			list = []domain.Evento{}
		}
		httpkit.JSON(w, http.StatusOK, map[string]any{"results": list})
	})

	// Append-only: registros de auditoria são imutáveis (sem PUT/PATCH/DELETE).
	mux.HandleFunc("POST /api/v1/audit/events", func(w http.ResponseWriter, r *http.Request) {
		var n domain.NovoEvento
		if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 8192)).Decode(&n); err != nil {
			httpkit.Error(w, http.StatusBadRequest, "bad_request", "corpo inválido")
			return
		}
		if err := n.Valida(); err != nil {
			httpkit.Error(w, http.StatusBadRequest, "bad_request", err.Error())
			return
		}
		e, err := repo.Append(r.Context(), httpkit.UserID(r.Context()), n)
		if err != nil {
			httpkit.Error(w, http.StatusInternalServerError, "internal", "falha ao registrar evento")
			return
		}
		httpkit.JSON(w, http.StatusCreated, e)
	})

	return httpkit.Chain(mux,
		httpkit.Recoverer,
		httpkit.RequestLogger,
		httpkit.SecurityHeaders,
		httpkit.CORS(cfg.CORSOrigins),
		httpkit.Authn(authPub, cfg.AuthIssuer),
	)
}
