package api

import (
	"context"
	"net/http"

	"opensight/services/account-service/internal/repository"
)

type ctxKey int

const userIDKey ctxKey = iota

// WithUser injeta o userID no contexto.
//
// PLACEHOLDER DE SEGURANÇA: por enquanto lê o header `X-User-ID` (dev) e cai
// para um usuário-semente. ANTES DE PRODUÇÃO, substituir por validação de JWT
// (RS256, emitido pelo auth-service): extrair o `sub` do token do header
// Authorization: Bearer e rejeitar (401) se ausente/ inválido. O isolamento por
// usuário no repositório já está pronto para receber esse userID real.
func WithUser(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		uid := r.Header.Get("X-User-ID")
		if uid == "" {
			uid = repository.DevUserID
		}
		ctx := context.WithValue(r.Context(), userIDKey, uid)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// UserID recupera o userID do contexto (vazio se ausente).
func UserID(ctx context.Context) string {
	if v, ok := ctx.Value(userIDKey).(string); ok {
		return v
	}
	return ""
}
