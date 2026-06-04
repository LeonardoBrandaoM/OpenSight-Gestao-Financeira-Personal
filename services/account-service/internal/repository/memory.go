package repository

import (
	"context"
	"sync"
	"time"

	"opensight/services/account-service/internal/domain"
)

// DevUserID é o usuário-semente usado em desenvolvimento (sem DB nem auth real).
const DevUserID = "00000000-0000-0000-0000-000000000001"

// MemoryRepo é uma implementação em memória (dev/testes). Thread-safe.
// Permite rodar o serviço e integrar o frontend sem provisionar Postgres.
type MemoryRepo struct {
	mu   sync.RWMutex
	data map[string][]domain.Account // userID -> contas
}

func NewMemoryRepo() *MemoryRepo {
	now := time.Now().UTC()
	return &MemoryRepo{
		data: map[string][]domain.Account{
			DevUserID: {
				{ID: "acc-itau-4471", UserID: DevUserID, Institution: "Itaú", Type: domain.TypeChecking, Nickname: "•••• 4471", BalanceCents: 1540000, Currency: "BRL", UpdatedAt: now},
				{ID: "acc-nubank-8820", UserID: DevUserID, Institution: "Nubank", Type: domain.TypeChecking, Nickname: "•••• 8820", BalanceCents: 823071, Currency: "BRL", UpdatedAt: now},
				{ID: "acc-inter-1190", UserID: DevUserID, Institution: "Inter", Type: domain.TypeChecking, Nickname: "•••• 1190", BalanceCents: 460000, Currency: "BRL", UpdatedAt: now},
				{ID: "acc-xp-carteira", UserID: DevUserID, Institution: "XP", Type: domain.TypeInvestment, Nickname: "Carteira", BalanceCents: 2248034, Currency: "BRL", UpdatedAt: now},
				{ID: "acc-nubank-3041", UserID: DevUserID, Institution: "Nubank", Type: domain.TypeCreditCard, Nickname: "•••• 3041", BalanceCents: -248034, Currency: "BRL", UpdatedAt: now},
			},
		},
	}
}

func (m *MemoryRepo) List(_ context.Context, userID string) ([]domain.Account, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	src := m.data[userID]
	out := make([]domain.Account, len(src))
	copy(out, src)
	return out, nil
}

func (m *MemoryRepo) Get(_ context.Context, userID, id string) (domain.Account, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, a := range m.data[userID] {
		if a.ID == id {
			return a, nil
		}
	}
	return domain.Account{}, domain.ErrNotFound
}
