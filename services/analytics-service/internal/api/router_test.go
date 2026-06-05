package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"opensight/services/analytics-service/internal/config"
	"opensight/services/analytics-service/internal/repository"
)

func testServer() http.Handler {
	return NewRouter(repository.NewMemoryRepo(), config.Config{CORSOrigins: []string{"http://localhost:5173"}}, nil)
}

func TestOverview(t *testing.T) {
	rec := httptest.NewRecorder()
	testServer().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/v1/analytics/overview", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d, quer 200", rec.Code)
	}
	var body struct {
		BalanceSeries []map[string]any `json:"balanceSeries"`
		Cashflow      []map[string]any `json:"cashflow"`
		ByCategory    []map[string]any `json:"byCategory"`
		Resumo        map[string]any   `json:"resumo"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("json inválido: %v", err)
	}
	if len(body.BalanceSeries) == 0 || len(body.Cashflow) == 0 || len(body.ByCategory) == 0 {
		t.Fatalf("agregações vazias: %+v", body)
	}
	if body.Resumo["receitasMes"] == nil {
		t.Fatal("resumo sem receitasMes")
	}
}
