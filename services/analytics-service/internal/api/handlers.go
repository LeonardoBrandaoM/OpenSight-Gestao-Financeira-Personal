package api

import (
	"net/http"

	"opensight/services/analytics-service/internal/httpx"
	"opensight/services/analytics-service/internal/repository"
)

type Handlers struct {
	repo repository.AnalyticsRepository
}

func NewHandlers(repo repository.AnalyticsRepository) *Handlers {
	return &Handlers{repo: repo}
}

func (h *Handlers) health(w http.ResponseWriter, _ *http.Request) {
	httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// GET /api/v1/analytics/overview — agregações do dashboard do usuário.
func (h *Handlers) overview(w http.ResponseWriter, r *http.Request) {
	ov, err := h.repo.Overview(r.Context(), UserID(r.Context()))
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "internal", "falha ao calcular agregações")
		return
	}
	httpx.JSON(w, http.StatusOK, ov)
}
