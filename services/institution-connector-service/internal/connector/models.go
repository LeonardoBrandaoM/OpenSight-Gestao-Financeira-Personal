package connector

// Modelos mínimos mapeados dos payloads da Pluggy. São tipos de LEITURA apenas.
// Quando o modelo canônico interno (provider-agnostic, RNF-012) for extraído,
// estes ficam como DTOs da borda Pluggy e o mapeamento vive no anti-corruption layer.

// Paginated é o envelope de paginação da Pluggy (ex.: /transactions).
type Paginated[T any] struct {
	Total      int `json:"total"`
	TotalPages int `json:"totalPages"`
	Page       int `json:"page"`
	Results    []T `json:"results"`
}

// resultsEnvelope é o envelope simples { "results": [...] } (ex.: /accounts).
type resultsEnvelope[T any] struct {
	Results []T `json:"results"`
}

// Account — conta bancária ou cartão de crédito (GET /accounts, /accounts/{id}).
type Account struct {
	ID            string      `json:"id"`
	ItemID        string      `json:"itemId"`
	Type          string      `json:"type"`    // BANK | CREDIT
	Subtype       string      `json:"subtype"` // CHECKING_ACCOUNT | SAVINGS_ACCOUNT | CREDIT_CARD
	Number        string      `json:"number"`
	Name          string      `json:"name"`
	MarketingName string      `json:"marketingName"`
	Owner         string      `json:"owner"`
	TaxNumber     string      `json:"taxNumber"`
	Balance       float64     `json:"balance"`
	CurrencyCode  string      `json:"currencyCode"`
	BankData      *BankData   `json:"bankData,omitempty"`
	CreditData    *CreditData `json:"creditData,omitempty"`
}

type BankData struct {
	TransferNumber               string   `json:"transferNumber"`
	ClosingBalance               *float64 `json:"closingBalance"`
	AutomaticallyInvestedBalance *float64 `json:"automaticallyInvestedBalance"`
	OverdraftContractedLimit     *float64 `json:"overdraftContractedLimit"`
	OverdraftUsedLimit           *float64 `json:"overdraftUsedLimit"`
}

type CreditData struct {
	Level                string   `json:"level"`
	Brand                string   `json:"brand"`
	BalanceCloseDate     string   `json:"balanceCloseDate"`
	BalanceDueDate       string   `json:"balanceDueDate"`
	AvailableCreditLimit *float64 `json:"availableCreditLimit"`
	CreditLimit          *float64 `json:"creditLimit"`
	MinimumPayment       *float64 `json:"minimumPayment"`
}

// Transaction — movimentação financeira (GET /transactions).
type Transaction struct {
	ID             string   `json:"id"`
	AccountID      string   `json:"accountId"`
	Date           string   `json:"date"` // ISO8601 (UTC)
	Description    string   `json:"description"`
	DescriptionRaw string   `json:"descriptionRaw"`
	Amount         float64  `json:"amount"`
	Balance        *float64 `json:"balance"`
	CurrencyCode   string   `json:"currencyCode"`
	Category       *string  `json:"category"`
	Type           string   `json:"type"`   // DEBIT | CREDIT
	Status         string   `json:"status"` // PENDING | POSTED
	ProviderCode   string   `json:"providerCode"`
}

// Item — conexão com uma instituição (GET /items/{id}).
type Item struct {
	ID              string        `json:"id"`
	Status          string        `json:"status"`
	ExecutionStatus string        `json:"executionStatus"`
	CreatedAt       string        `json:"createdAt"`
	UpdatedAt       string        `json:"updatedAt"`
	Connector       ConnectorInfo `json:"connector"`
}

type ConnectorInfo struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	Type           string `json:"type"`
	InstitutionURL string `json:"institutionUrl"`
}

// Identity — dados cadastrais do titular (GET /identity).
type Identity struct {
	ID           string          `json:"id"`
	ItemID       string          `json:"itemId"`
	FullName     string          `json:"fullName"`
	Document     string          `json:"document"`
	DocumentType string          `json:"documentType"`
	BirthDate    string          `json:"birthDate"`
	Emails       []IdentityValue `json:"emails"`
	PhoneNumbers []IdentityValue `json:"phoneNumbers"`
}

type IdentityValue struct {
	Value string `json:"value"`
	Type  string `json:"type"`
}

// Investment — posição de investimento (GET /investments).
type Investment struct {
	ID           string   `json:"id"`
	ItemID       string   `json:"itemId"`
	Type         string   `json:"type"`
	Subtype      string   `json:"subtype"`
	Name         string   `json:"name"`
	Balance      float64  `json:"balance"`
	CurrencyCode string   `json:"currencyCode"`
	Value        *float64 `json:"value"`
	Quantity     *float64 `json:"quantity"`
	Amount       *float64 `json:"amount"`
}
