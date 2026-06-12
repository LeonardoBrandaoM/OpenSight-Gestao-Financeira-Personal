package repository

import (
	"context"
	"fmt"
	"sync"
	"time"

	"opensight/services/privacy-service/internal/domain"
)

type PrivacyRepository interface {
	List(ctx context.Context, userID string) ([]domain.Solicitacao, error)
	Create(ctx context.Context, userID string, tipo domain.TipoSolicitacao) (domain.Solicitacao, error)
}

// MemoryRepo é seguro para concorrência (handlers HTTP mutam o estado).
type MemoryRepo struct {
	mu   sync.RWMutex
	seq  int
	data map[string][]domain.Solicitacao
}

func NewMemoryRepo() *MemoryRepo {
	return &MemoryRepo{data: map[string][]domain.Solicitacao{}}
}

func (m *MemoryRepo) List(_ context.Context, userID string) ([]domain.Solicitacao, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	// Copia defensiva para não vazar o slice interno.
	out := make([]domain.Solicitacao, len(m.data[userID]))
	copy(out, m.data[userID])
	return out, nil
}

func (m *MemoryRepo) Create(_ context.Context, userID string, tipo domain.TipoSolicitacao) (domain.Solicitacao, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.seq++
	s := domain.Solicitacao{
		ID:       fmt.Sprintf("req-%d", m.seq),
		Tipo:     tipo,
		Status:   "pendente",
		CriadoEm: time.Now().UTC().Format(time.RFC3339),
	}
	m.data[userID] = append(m.data[userID], s)
	return s, nil
}
