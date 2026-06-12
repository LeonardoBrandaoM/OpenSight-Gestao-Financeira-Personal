// Package repository — persistência de usuários (queries parametrizadas).
package repository

import (
	"context"

	"opensight/services/auth-service/internal/domain"
)

type UserRepository interface {
	Create(ctx context.Context, u domain.User) error // domain.ErrEmailTaken se duplicado
	GetByEmail(ctx context.Context, email string) (domain.User, error)
}
