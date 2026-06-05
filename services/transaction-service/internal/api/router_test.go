package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"opensight/services/transaction-service/internal/config"
	"opensight/services/transaction-service/internal/repository"
)

func testServer() http.Handler {
	// authPub nil = modo dev (sem JWT).
	return NewRouter(repository.NewMemoryRepo(), config.Config{CORSOrigins: []string{"http://localhost:5173"}}, nil)
}

func decodeResults(t *testing.T, rec *httptest.ResponseRecorder) []map[string]any {
	t.Helper()
	var body struct {
		Results []map[string]any `json:"results"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("json inválido: %v", err)
	}
	return body.Results
}

func TestHealth(t *testing.T) {
	rec := httptest.NewRecorder()
	testServer().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/healthz", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("healthz: %d", rec.Code)
	}
}

func TestListTransactions(t *testing.T) {
	rec := httptest.NewRecorder()
	testServer().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/v1/transactions", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d, quer 200", rec.Code)
	}
	res := decodeResults(t, rec)
	if len(res) != 7 {
		t.Fatalf("transações = %d, quer 7", len(res))
	}
	if _, leaked := res[0]["userId"]; leaked {
		t.Fatal("userId NÃO deve ser exposto no JSON")
	}
}

func TestFilterByAccount(t *testing.T) {
	rec := httptest.NewRecorder()
	testServer().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/v1/transactions?accountId=acc-nubank-8820", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d, quer 200", rec.Code)
	}
	if res := decodeResults(t, rec); len(res) != 3 {
		t.Fatalf("filtro por conta = %d, quer 3", len(res))
	}
}
