// Package contracts define o modelo CANÔNICO compartilhado entre serviços
// (provider-agnostic, RNF-012). É o vocabulário comum: o conector mapeia os
// payloads do agregador (Pluggy/Belvo) para estes tipos, e os serviços de
// dominio (account, transaction, analytics...) os consomem. Sem dependencias
// externas. Valores monetarios sempre em centavos (inteiro).
package contracts

// TxType — natureza canonica da transacao.
type TxType string

const (
	Debit  TxType = "DEBIT"  // saida
	Credit TxType = "CREDIT" // entrada
)

// Status canonico da transacao.
const (
	StatusPending = "PENDING"
	StatusPosted  = "POSTED"
)

// Transaction — transacao canonica. `UserID` nunca e serializado (isolamento).
type Transaction struct {
	ID          string `json:"id"`
	UserID      string `json:"-"`
	AccountID   string `json:"accountId"`
	Date        string `json:"date"` // ISO8601 (UTC)
	Description string `json:"description"`
	AmountCents int64  `json:"amountCents"` // negativo = saida
	Currency    string `json:"currency"`    // ISO-4217 (ex.: BRL)
	Category    string `json:"category"`
	Type        TxType `json:"type"`
	Status      string `json:"status"`
}

// AccountType — tipo canonico de conta.
type AccountType string

const (
	Checking   AccountType = "CHECKING"
	Savings    AccountType = "SAVINGS"
	CreditCard AccountType = "CREDIT_CARD"
	Investment AccountType = "INVESTMENT"
)

// Account — conta canonica (espelha o que o account-service expoe).
type Account struct {
	ID           string      `json:"id"`
	UserID       string      `json:"-"`
	Institution  string      `json:"institution"`
	Type         AccountType `json:"type"`
	Nickname     string      `json:"nickname"`
	BalanceCents int64       `json:"balanceCents"`
	Currency     string      `json:"currency"`
}
