package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"opensight/services/budget-service/internal/config"
	"opensight/services/budget-service/internal/repository"
)

func TestBudgetOverview(t *testing.T) {
	srv := NewRouter(repository.NewMemoryRepo(), config.Config{CORSOrigins: []string{"http://localhost:5173"}}, nil)
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/v1/budget/overview", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d, quer 200", rec.Code)
	}
	var body struct {
		Metas           []map[string]any `json:"metas"`
		Comprometimento map[string]any   `json:"comprometimento"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("json: %v", err)
	}
	if len(body.Metas) != 4 || body.Comprometimento["status"] == nil {
		t.Fatalf("overview inesperado: %+v", body)
	}
}
