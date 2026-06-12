// Package canonical mapeia os DTOs da borda Pluggy (internal/connector) para o
// modelo CANÔNICO compartilhado (packages/contracts). É o anti-corruption layer
// (RNF-012): o resto do sistema só conhece os contratos, não a Pluggy.
package canonical

import (
	"math"

	"opensight/packages/contracts"
	"opensight/services/institution-connector-service/internal/connector"
)

// toCents converte um valor em unidades monetárias (float) para centavos (int).
func toCents(v float64) int64 { return int64(math.Round(v * 100)) }

// MapAccount converte uma conta Pluggy para a conta canônica. `institution` vem
// do item/conexão (a Pluggy não o traz na própria conta).
func MapAccount(a connector.Account, userID, institution string) contracts.Account {
	return contracts.Account{
		ID:           a.ID,
		UserID:       userID,
		Institution:  institution,
		Type:         mapAccountType(a.Type, a.Subtype),
		Nickname:     nickname(a),
		BalanceCents: toCents(a.Balance),
		Currency:     a.CurrencyCode,
	}
}

func mapAccountType(typ, subtype string) contracts.AccountType {
	switch typ {
	case "CREDIT":
		return contracts.CreditCard
	case "BANK":
		if subtype == "SAVINGS_ACCOUNT" {
			return contracts.Savings
		}
		return contracts.Checking
	default:
		return contracts.Checking
	}
}

func nickname(a connector.Account) string {
	if a.Name != "" {
		return a.Name
	}
	return a.Number
}

// MapTransaction converte uma transação Pluggy para a transação canônica.
func MapTransaction(t connector.Transaction, userID string) contracts.Transaction {
	category := ""
	if t.Category != nil {
		category = *t.Category
	}
	return contracts.Transaction{
		ID:          t.ID,
		UserID:      userID,
		AccountID:   t.AccountID,
		Date:        t.Date,
		Description: t.Description,
		AmountCents: toCents(t.Amount),
		Currency:    t.CurrencyCode,
		Category:    category,
		Type:        mapTxType(t.Type),
		Status:      mapStatus(t.Status),
	}
}

func mapTxType(s string) contracts.TxType {
	if s == "CREDIT" {
		return contracts.Credit
	}
	return contracts.Debit
}

func mapStatus(s string) string {
	if s == "PENDING" {
		return contracts.StatusPending
	}
	return contracts.StatusPosted
}
