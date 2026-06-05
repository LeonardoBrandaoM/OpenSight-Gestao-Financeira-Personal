// Package repository define o contrato de persistência de contas e suas
// implementações. Toda query é PARAMETRIZADA (sem concatenação de input) e
// sempre escopada por user_id (isolamento por usuário).
package repository

import (
	"context"

	"opensight/services/account-service/internal/domain"
)

// AccountRepository é a porta de saída do domínio para persistência.
type AccountRepository interface {
	List(ctx context.Context, userID string) ([]domain.Account, error)
	Get(ctx context.Context, userID, id string) (domain.Account, error)
	BalanceHistory(ctx context.Context, userID, accountID string) ([]domain.BalancePoint, error)
}
