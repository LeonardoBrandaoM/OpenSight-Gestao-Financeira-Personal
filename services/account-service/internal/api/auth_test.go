package api

import (
	"crypto/rand"
	"crypto/rsa"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"opensight/services/account-service/internal/config"
	"opensight/services/account-service/internal/repository"
)

// Com chave pública configurada, a API EXIGE um JWT RS256 válido.
func TestAuthnRequiresJWT(t *testing.T) {
	priv, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("keygen: %v", err)
	}
	const issuer = "opensight-auth"
	srv := NewRouter(repository.NewMemoryRepo(), config.Config{AuthIssuer: issuer}, &priv.PublicKey)

	// Sem token -> 401.
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/v1/accounts", nil))
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("sem token: status %d, quer 401", rec.Code)
	}

	// Token RS256 válido (sub = usuário-semente) -> 200.
	claims := jwt.RegisteredClaims{
		Subject:   repository.DevUserID,
		Issuer:    issuer,
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Minute)),
	}
	signed, err := jwt.NewWithClaims(jwt.SigningMethodRS256, claims).SignedString(priv)
	if err != nil {
		t.Fatalf("sign: %v", err)
	}
	req := httptest.NewRequest(http.MethodGet, "/api/v1/accounts", nil)
	req.Header.Set("Authorization", "Bearer "+signed)
	rec2 := httptest.NewRecorder()
	srv.ServeHTTP(rec2, req)
	if rec2.Code != http.StatusOK {
		t.Fatalf("token válido: status %d, quer 200", rec2.Code)
	}

	// Token assinado por outra chave -> 401.
	other, _ := rsa.GenerateKey(rand.Reader, 2048)
	bad, _ := jwt.NewWithClaims(jwt.SigningMethodRS256, claims).SignedString(other)
	req3 := httptest.NewRequest(http.MethodGet, "/api/v1/accounts", nil)
	req3.Header.Set("Authorization", "Bearer "+bad)
	rec3 := httptest.NewRecorder()
	srv.ServeHTTP(rec3, req3)
	if rec3.Code != http.StatusUnauthorized {
		t.Fatalf("token de outra chave: status %d, quer 401", rec3.Code)
	}
}
