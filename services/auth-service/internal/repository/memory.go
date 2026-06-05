package repository

import (
	"context"
	"sync"

	"opensight/services/auth-service/internal/domain"
)

// MemoryRepo — usuários em memória (dev/testes). Chaveado por email normalizado.
type MemoryRepo struct {
	mu    sync.RWMutex
	users map[string]domain.User
}

func NewMemoryRepo() *MemoryRepo {
	return &MemoryRepo{users: make(map[string]domain.User)}
}

func (m *MemoryRepo) Create(_ context.Context, u domain.User) error {
	key := domain.NormalizeEmail(u.Email)
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, exists := m.users[key]; exists {
		return domain.ErrEmailTaken
	}
	m.users[key] = u
	return nil
}

func (m *MemoryRepo) GetByEmail(_ context.Context, email string) (domain.User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	u, ok := m.users[domain.NormalizeEmail(email)]
	if !ok {
		return domain.User{}, domain.ErrNotFound
	}
	return u, nil
}
