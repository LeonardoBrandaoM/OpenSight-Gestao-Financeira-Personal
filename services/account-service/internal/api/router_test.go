package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"opensight/services/account-service/internal/config"
	"opensight/services/account-service/internal/repository"
)

func testServer() http.Handler {
	// authPub nil = modo dev (sem JWT); os testes exercitam o fallback de usuário.
	return NewRouter(repository.NewMemoryRepo(), config.Config{CORSOrigins: []string{"http://localhost:5173"}}, nil)
}

func TestHealth(t *testing.T) {
	rec := httptest.NewRecorder()
	testServer().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/healthz", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("healthz status = %d, quer 200", rec.Code)
	}
}

func TestListAccounts(t *testing.T) {
	rec := httptest.NewRecorder()
	testServer().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/v1/accounts", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, quer 200", rec.Code)
	}
	var body struct {
		Results []struct {
			ID     string `json:"id"`
			UserID string `json:"userId"` // deve estar AUSENTE (json:"-")
		} `json:"results"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("json inválido: %v", err)
	}
	if len(body.Results) != 5 {
		t.Fatalf("contas = %d, quer 5", len(body.Results))
	}
	if body.Results[0].UserID != "" {
		t.Fatal("userId NÃO deve ser exposto no JSON")
	}
}

func TestGetAccount(t *testing.T) {
	rec := httptest.NewRecorder()
	testServer().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/v1/accounts/acc-itau-4471", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, quer 200", rec.Code)
	}
}

func TestGetAccountNotFound(t *testing.T) {
	rec := httptest.NewRecorder()
	testServer().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/v1/accounts/inexistente", nil))
	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, quer 404", rec.Code)
	}
}

func TestCORSPreflight(t *testing.T) {
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodOptions, "/api/v1/accounts", nil)
	req.Header.Set("Origin", "http://localhost:5173")
	testServer().ServeHTTP(rec, req)
	if rec.Code != http.StatusNoContent {
		t.Fatalf("preflight status = %d, quer 204", rec.Code)
	}
	if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:5173" {
		t.Fatalf("ACAO = %q, quer a origem permitida", got)
	}
}
