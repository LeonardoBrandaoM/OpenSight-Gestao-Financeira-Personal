package repository

import (
	"context"

	"opensight/packages/httpkit"
	"opensight/services/consent-service/internal/domain"
)

type ConsentRepository interface {
	List(ctx context.Context, userID string) ([]domain.Consentimento, error)
}

type MemoryRepo struct {
	data map[string][]domain.Consentimento
}

func NewMemoryRepo() *MemoryRepo {
	return &MemoryRepo{
		data: map[string][]domain.Consentimento{
			httpkit.DevUserID: {
				{Instituicao: "Itaú", Escopos: []string{"ACCOUNTS_READ", "TRANSACTIONS_READ"}, Status: "ativo", ExpiraEm: 68, ConcedidoEm: "24/03/2026"},
				{Instituicao: "Nubank", Escopos: []string{"ACCOUNTS_READ", "TRANSACTIONS_READ", "IDENTITY_READ"}, Status: "ativo", ExpiraEm: 54, ConcedidoEm: "10/03/2026"},
				{Instituicao: "Inter", Escopos: []string{"ACCOUNTS_READ", "TRANSACTIONS_READ"}, Status: "expirando", ExpiraEm: 21, ConcedidoEm: "08/02/2026"},
				{Instituicao: "XP", Escopos: []string{"ACCOUNTS_READ"}, Status: "ativo", ExpiraEm: 79, ConcedidoEm: "01/04/2026"},
			},
		},
	}
}

func (m *MemoryRepo) List(_ context.Context, userID string) ([]domain.Consentimento, error) {
	return m.data[userID], nil
}
