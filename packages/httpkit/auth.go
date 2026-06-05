package httpkit

import (
	"context"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type ctxKey int

const userIDKey ctxKey = iota

// DevUserID — usuário-semente para o modo dev (sem auth real).
const DevUserID = "00000000-0000-0000-0000-000000000001"

// ParsePublicKeyPEM lê uma chave pública RSA (PKIX/PEM).
func ParsePublicKeyPEM(p string) (*rsa.PublicKey, error) {
	block, _ := pem.Decode([]byte(p))
	if block == nil {
		return nil, errors.New("PEM de chave pública inválido")
	}
	k, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	pk, ok := k.(*rsa.PublicKey)
	if !ok {
		return nil, errors.New("a chave não é RSA")
	}
	return pk, nil
}

// Verify valida assinatura RS256, issuer e exp; devolve o subject (userID).
func Verify(tokenStr string, pub *rsa.PublicKey, issuer string) (string, error) {
	claims := &jwt.RegisteredClaims{}
	_, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("algoritmo inesperado: %v", t.Header["alg"])
		}
		return pub, nil
	}, jwt.WithValidMethods([]string{"RS256"}), jwt.WithIssuer(issuer))
	if err != nil {
		return "", err
	}
	if claims.Subject == "" {
		return "", errors.New("token sem subject")
	}
	return claims.Subject, nil
}

// Authn: com chave pública, EXIGE Bearer JWT válido (usa sub como userID); sem
// ela, modo dev (X-User-ID ou DevUserID). Isolamento por usuário fica no repo.
func Authn(pub *rsa.PublicKey, issuer string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			var uid string
			if pub != nil {
				const prefix = "Bearer "
				authz := r.Header.Get("Authorization")
				if !strings.HasPrefix(authz, prefix) {
					Error(w, http.StatusUnauthorized, "unauthorized", "token ausente")
					return
				}
				sub, err := Verify(strings.TrimPrefix(authz, prefix), pub, issuer)
				if err != nil {
					Error(w, http.StatusUnauthorized, "unauthorized", "token inválido")
					return
				}
				uid = sub
			} else {
				uid = r.Header.Get("X-User-ID")
				if uid == "" {
					uid = DevUserID
				}
			}
			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), userIDKey, uid)))
		})
	}
}

// UserID recupera o userID do contexto.
func UserID(ctx context.Context) string {
	if v, ok := ctx.Value(userIDKey).(string); ok {
		return v
	}
	return ""
}
