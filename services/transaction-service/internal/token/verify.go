// Package token verifica JWTs RS256 emitidos pelo auth-service.
package token

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

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
