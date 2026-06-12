package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"opensight/services/auth-service/internal/config"
	"opensight/services/auth-service/internal/repository"
	"opensight/services/auth-service/internal/token"
)

func testServer(t *testing.T) http.Handler {
	t.Helper()
	signer, err := token.NewSigner("", "opensight-auth", 15*time.Minute)
	if err != nil {
		t.Fatalf("signer: %v", err)
	}
	return NewRouter(repository.NewMemoryRepo(), signer, config.Config{CORSOrigins: []string{"http://localhost:5173"}})
}

func post(t *testing.T, srv http.Handler, path, body string) *httptest.ResponseRecorder {
	t.Helper()
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, path, bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	srv.ServeHTTP(rec, req)
	return rec
}

func TestRegisterValidation(t *testing.T) {
	srv := testServer(t)
	if rec := post(t, srv, "/api/v1/auth/register", `{"email":"a@b.com","password":"short"}`); rec.Code != http.StatusBadRequest {
		t.Fatalf("senha curta: status %d, quer 400", rec.Code)
	}
	if rec := post(t, srv, "/api/v1/auth/register", `{"email":"naoemail","password":"supersecret123"}`); rec.Code != http.StatusBadRequest {
		t.Fatalf("email inválido: status %d, quer 400", rec.Code)
	}
}

func TestRegisterLoginMeFlow(t *testing.T) {
	srv := testServer(t)
	const creds = `{"email":"User@Exemplo.com","password":"supersecret123"}`

	if rec := post(t, srv, "/api/v1/auth/register", creds); rec.Code != http.StatusCreated {
		t.Fatalf("register: status %d, quer 201", rec.Code)
	}
	// duplicado (mesmo email, case-insensitive)
	if rec := post(t, srv, "/api/v1/auth/register", `{"email":"user@exemplo.com","password":"supersecret123"}`); rec.Code != http.StatusConflict {
		t.Fatalf("duplicado: status %d, quer 409", rec.Code)
	}
	// senha errada
	if rec := post(t, srv, "/api/v1/auth/login", `{"email":"user@exemplo.com","password":"errada1234567"}`); rec.Code != http.StatusUnauthorized {
		t.Fatalf("login errado: status %d, quer 401", rec.Code)
	}
	// login correto
	rec := post(t, srv, "/api/v1/auth/login", creds)
	if rec.Code != http.StatusOK {
		t.Fatalf("login: status %d, quer 200", rec.Code)
	}
	var tok struct {
		AccessToken string `json:"accessToken"`
		TokenType   string `json:"tokenType"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&tok); err != nil || tok.AccessToken == "" || tok.TokenType != "Bearer" {
		t.Fatalf("resposta de login inválida: %+v err=%v", tok, err)
	}
	// /me com o token
	meReq := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	meReq.Header.Set("Authorization", "Bearer "+tok.AccessToken)
	meRec := httptest.NewRecorder()
	srv.ServeHTTP(meRec, meReq)
	if meRec.Code != http.StatusOK {
		t.Fatalf("me: status %d, quer 200", meRec.Code)
	}
	// /me sem token
	meRec2 := httptest.NewRecorder()
	srv.ServeHTTP(meRec2, httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil))
	if meRec2.Code != http.StatusUnauthorized {
		t.Fatalf("me sem token: status %d, quer 401", meRec2.Code)
	}
}
