package api

import (
	"context"
	"crypto/rsa"
	"net/http"
	"strings"

	"opensight/services/account-service/internal/httpx"
	"opensight/services/account-service/internal/repository"
	"opensight/services/account-service/internal/token"
)

type ctxKey int

const userIDKey ctxKey = iota

// Authn é o middleware de autenticação.
//   - Com chave pública (pub != nil): EXIGE `Authorization: Bearer <JWT>` válido
//     (RS256, issuer correto), usa o `sub` como userID; 401 se ausente/inválido.
//   - Sem chave (dev): cai para `X-User-ID` ou o usuário-semente — permite rodar
//     sem o auth-service. O isolamento por usuário no repositório é o mesmo.
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

// UserID recupera o userID do contexto (vazio se ausente).
func UserID(ctx context.Context) string {
	if v, ok := ctx.Value(userIDKey).(string); ok {
		return v
	}
	return ""
}
