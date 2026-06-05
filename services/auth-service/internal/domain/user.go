// Package domain — modelo de usuário e regras de credenciais.
package domain

import (
	"errors"
	"net/mail"
	"strings"
	"time"
)

var (
	ErrNotFound           = errors.New("usuário não encontrado")
	ErrEmailTaken         = errors.New("email já cadastrado")
	ErrInvalidCredentials = errors.New("credenciais inválidas")
)

// MinPasswordLen segue a política do SRS (RF-001): mínimo de 12 caracteres.
const MinPasswordLen = 12

// User — `PasswordHash` nunca é serializado.
type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"createdAt"`
}

// NormalizeEmail deixa o email comparável (minúsculo, sem espaços).
func NormalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func ValidateEmail(email string) error {
	if _, err := mail.ParseAddress(email); err != nil {
		return errors.New("email inválido")
	}
	return nil
}

func ValidatePassword(pw string) error {
	if len(pw) < MinPasswordLen {
		return errors.New("a senha deve ter ao menos 12 caracteres")
	}
	return nil
}
