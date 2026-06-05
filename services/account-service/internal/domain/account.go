// Package domain contém o modelo canônico de Conta e suas regras — independente
// de provedor (RNF-012) e de banco. Sem dependências de infraestrutura.
package domain

import (
	"errors"
	"time"
)

// ErrNotFound é retornado quando a conta não existe (ou não pertence ao usuário).
var ErrNotFound = errors.New("conta não encontrada")

// Tipos canônicos de conta (mapeados na borda a partir do agregador).
const (
	TypeChecking   = "CHECKING"
	TypeSavings    = "SAVINGS"
	TypeCreditCard = "CREDIT_CARD"
	TypeInvestment = "INVESTMENT"
)

var validTypes = map[string]bool{
	TypeChecking: true, TypeSavings: true, TypeCreditCard: true, TypeInvestment: true,
}

// Account é uma conta consolidada do usuário. Valores monetários em centavos
// (inteiro) — RN de qualidade de dados do SRS. `UserID` nunca é serializado.
type Account struct {
	ID           string    `json:"id"`
	UserID       string    `json:"-"` // isolamento por usuário; nunca exposto no JSON
	Institution  string    `json:"institution"`
	Type         string    `json:"type"`     // CHECKING | SAVINGS | CREDIT_CARD | INVESTMENT
	Nickname     string    `json:"nickname"` // mascarado (ex.: "•••• 4471"); número completo é PII e fica fora
	BalanceCents int64     `json:"balanceCents"`
	Currency     string    `json:"currency"` // ISO-4217 (ex.: BRL)
	UpdatedAt    time.Time `json:"updatedAt"`
}

// BalancePoint é um ponto do histórico de saldo (saldo em reais).
type BalancePoint struct {
	Mes   string  `json:"mes"`
	Saldo float64 `json:"saldo"`
}

// Validate garante invariantes mínimas antes de persistir/retornar.
func (a Account) Validate() error {
	if a.UserID == "" {
		return errors.New("userID é obrigatório")
	}
	if a.Institution == "" {
		return errors.New("institution é obrigatório")
	}
	if !validTypes[a.Type] {
		return errors.New("type inválido")
	}
	if len(a.Currency) != 3 {
		return errors.New("currency deve ser ISO-4217 (3 letras)")
	}
	return nil
}
