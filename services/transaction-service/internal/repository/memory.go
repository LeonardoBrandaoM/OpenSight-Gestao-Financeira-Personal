package repository

import (
	"context"

	"opensight/packages/contracts"
)

// MemoryRepo — transações em memória (dev/testes). Dados imutáveis após criação.
type MemoryRepo struct {
	data map[string][]contracts.Transaction // userID -> transações (mais recentes primeiro)
}

func NewMemoryRepo() *MemoryRepo {
	return &MemoryRepo{
		data: map[string][]contracts.Transaction{
			DevUserID: {
				{ID: "tx-1", UserID: DevUserID, AccountID: "acc-nubank-8820", Date: "2026-05-30", Description: "Supermercado Pão de Açúcar", AmountCents: -28740, Currency: "BRL", Category: "Alimentação", Type: contracts.Debit, Status: contracts.StatusPosted},
				{ID: "tx-2", UserID: DevUserID, AccountID: "acc-itau-4471", Date: "2026-05-29", Description: "Salário", AmountCents: 912000, Currency: "BRL", Category: "Receita", Type: contracts.Credit, Status: contracts.StatusPosted},
				{ID: "tx-3", UserID: DevUserID, AccountID: "acc-nubank-8820", Date: "2026-05-28", Description: "Posto Shell", AmountCents: -21000, Currency: "BRL", Category: "Transporte", Type: contracts.Debit, Status: contracts.StatusPosted},
				{ID: "tx-4", UserID: DevUserID, AccountID: "acc-inter-1190", Date: "2026-05-27", Description: "Spotify", AmountCents: -2190, Currency: "BRL", Category: "Assinaturas", Type: contracts.Debit, Status: contracts.StatusPosted},
				{ID: "tx-5", UserID: DevUserID, AccountID: "acc-nubank-8820", Date: "2026-05-26", Description: "Farmácia Drogasil", AmountCents: -9630, Currency: "BRL", Category: "Saúde", Type: contracts.Debit, Status: contracts.StatusPosted},
				{ID: "tx-6", UserID: DevUserID, AccountID: "acc-itau-4471", Date: "2026-05-25", Description: "Reembolso amigo", AmountCents: 15000, Currency: "BRL", Category: "Transferência", Type: contracts.Credit, Status: contracts.StatusPosted},
				{ID: "tx-7", UserID: DevUserID, AccountID: "acc-inter-1190", Date: "2026-05-24", Description: "Cinema", AmountCents: -6400, Currency: "BRL", Category: "Lazer", Type: contracts.Debit, Status: contracts.StatusPosted},
			},
		},
	}
}

func (m *MemoryRepo) List(_ context.Context, userID, accountID string) ([]contracts.Transaction, error) {
	out := make([]contracts.Transaction, 0)
	for _, t := range m.data[userID] {
		if accountID == "" || t.AccountID == accountID {
			out = append(out, t)
		}
	}
	return out, nil
}
