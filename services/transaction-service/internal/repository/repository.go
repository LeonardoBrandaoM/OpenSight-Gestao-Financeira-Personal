// Package repository — persistência de transações (queries parametrizadas,
// escopadas por user_id). Usa o modelo canônico de packages/contracts.
package repository

import (
	"context"

	"opensight/packages/contracts"
)

// DevUserID — usuário-semente para dev/testes (sem auth real).
const DevUserID = "00000000-0000-0000-0000-000000000001"

type TransactionRepository interface {
	// List retorna as transações do usuário; accountID vazio = todas as contas.
	List(ctx context.Context, userID, accountID string) ([]contracts.Transaction, error)
}
