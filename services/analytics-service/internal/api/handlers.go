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

// GET /api/v1/analytics/categories — read-model dos gráficos avançados de Categorias.
func (h *Handlers) categories(w http.ResponseWriter, r *http.Request) {
	ci, err := h.repo.CategoryInsights(r.Context(), UserID(r.Context()))
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "internal", "falha ao calcular insights de categorias")
		return
	}
	httpx.JSON(w, http.StatusOK, ci)
}

// GET /api/v1/analytics/anomalies — scatter de detecção de anomalias (z-score).
func (h *Handlers) anomalies(w http.ResponseWriter, r *http.Request) {
	an, err := h.repo.Anomalies(r.Context(), UserID(r.Context()))
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "internal", "falha ao calcular anomalias")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"results": an})
}
