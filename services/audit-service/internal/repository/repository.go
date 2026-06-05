package repository

import (
	"context"
	"fmt"
	"sync"
	"time"

	"opensight/services/audit-service/internal/domain"
)

type AuditRepository interface {
	List(ctx context.Context, userID string) ([]domain.Evento, error)
	Append(ctx context.Context, userID string, n domain.NovoEvento) (domain.Evento, error)
}

// MemoryRepo é append-only e seguro para concorrência. Não há update/delete.
type MemoryRepo struct {
	mu   sync.RWMutex
	seq  int
	data map[string][]domain.Evento
}

func NewMemoryRepo() *MemoryRepo {
	return &MemoryRepo{data: map[string][]domain.Evento{}}
}

func (m *MemoryRepo) List(_ context.Context, userID string) ([]domain.Evento, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]domain.Evento, len(m.data[userID]))
	copy(out, m.data[userID])
	return out, nil
}

func (m *MemoryRepo) Append(_ context.Context, userID string, n domain.NovoEvento) (domain.Evento, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.seq++
	e := domain.Evento{
		ID:        fmt.Sprintf("evt-%d", m.seq),
		Acao:      n.Acao,
		Recurso:   n.Recurso,
		Resultado: n.Resultado,
		Origem:    n.Origem,
		Em:        time.Now().UTC().Format(time.RFC3339),
	}
	m.data[userID] = append(m.data[userID], e)
	return e, nil
}
