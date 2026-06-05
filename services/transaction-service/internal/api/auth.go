package api

import (
	"context"
	"crypto/rsa"
	"net/http"
	"strings"

	"opensight/services/transaction-service/internal/httpx"
	"opensight/services/transaction-service/internal/repository"
	"opensight/services/transaction-service/internal/token"
)

type ctxKey int

const userIDKey ctxKey = iota

// Authn: com chave pública, EXIGE JWT RS256 válido (usa sub); sem ela, fallback
// dev (X-User-ID / usuário-semente). Isolamento por usuário no repositório.
func Authn(pub *rsa.PublicKey, issuer string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			var uid string
			if pub != nil {
				const prefix = "Bearer "
				authz := r.Header.Get("Authorization")
				if !strings.HasPrefix(authz, prefix) {
					httpx.Error(w, http.StatusUnauthorized, "unauthorized", "token ausente")
					return
				}
				sub, err := token.Verify(strings.TrimPrefix(authz, prefix), pub, issuer)
				if err != nil {
					httpx.Error(w, http.StatusUnauthorized, "unauthorized", "token inválido")
					return
				}
				uid = sub
			} else {
				uid = r.Header.Get("X-User-ID")
				if uid == "" {
					uid = repository.DevUserID
				}
			}
			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), userIDKey, uid)))
		})
	}
}

func UserID(ctx context.Context) string {
	if v, ok := ctx.Value(userIDKey).(string); ok {
		return v
	}
	return ""
}
