// Package token assina e verifica JWTs RS256 (access tokens).
package token

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const keyID = "opensight-dev"

// Signer assina tokens e expõe a chave pública para verificação.
type Signer struct {
	priv      *rsa.PrivateKey
	issuer    string
	ttl       time.Duration
	ephemeral bool
}

// NewSigner usa a chave PEM informada; se vazia, gera uma efêmera (apenas dev).
func NewSigner(privPEM, issuer string, ttl time.Duration) (*Signer, error) {
	if privPEM == "" {
		priv, err := rsa.GenerateKey(rand.Reader, 2048)
		if err != nil {
			return nil, err
		}
		return &Signer{priv: priv, issuer: issuer, ttl: ttl, ephemeral: true}, nil
	}
	priv, err := parsePrivateKeyPEM(privPEM)
	if err != nil {
		return nil, err
	}
	return &Signer{priv: priv, issuer: issuer, ttl: ttl}, nil
}

func (s *Signer) Ephemeral() bool { return s.ephemeral }

// Sign emite um access token RS256 para o subject (userID).
func (s *Signer) Sign(sub string) (token string, expiresAt time.Time, err error) {
	now := time.Now()
	expiresAt = now.Add(s.ttl)
	claims := jwt.RegisteredClaims{
		Subject:   sub,
		Issuer:    s.issuer,
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(expiresAt),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	t.Header["kid"] = keyID
	token, err = t.SignedString(s.priv)
	return token, expiresAt, err
}

// Verify valida assinatura/issuer/exp e devolve o subject. Usado pelo /me.
func (s *Signer) Verify(tokenStr string) (sub string, err error) {
	return Verify(tokenStr, &s.priv.PublicKey, s.issuer)
}

// PublicKeyPEM devolve a chave pública em PEM (PKIX) para outros serviços.
func (s *Signer) PublicKeyPEM() (string, error) {
	der, err := x509.MarshalPKIXPublicKey(&s.priv.PublicKey)
	if err != nil {
		return "", err
	}
	return string(pem.EncodeToMemory(&pem.Block{Type: "PUBLIC KEY", Bytes: der})), nil
}

// Verify valida um JWT RS256 contra uma chave pública e issuer (reutilizável).
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

func parsePrivateKeyPEM(p string) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode([]byte(p))
	if block == nil {
		return nil, errors.New("PEM de chave privada inválido")
	}
	if k, err := x509.ParsePKCS1PrivateKey(block.Bytes); err == nil {
		return k, nil
	}
	k, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("chave privada não suportada: %w", err)
	}
	rk, ok := k.(*rsa.PrivateKey)
	if !ok {
		return nil, errors.New("a chave não é RSA")
	}
	return rk, nil
}
