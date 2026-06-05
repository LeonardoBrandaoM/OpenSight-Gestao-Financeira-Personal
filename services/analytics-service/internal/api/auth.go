package api

import (
	"context"
	"crypto/rsa"
	"net/http"
	"strings"

	"opensight/services/analytics-service/internal/httpx"
	"opensight/services/analytics-service/internal/repository"
	"opensight/services/analytics-service/internal/token"
)

type ctxKey int

const userIDKey ctxKey = iota

// Authn: exige JWT RS256 válido quando há chave pública; senão fallback dev.
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
