// Package domain — categorias e tipos de transação (categorization-service, RF-004).
// Categorias base + personalizadas coexistem; tipos têm efeito de fluxo.
package domain

// EfeitoFluxo: entra (receita) | sai (despesa) | neutro (não computa no fluxo).
type TipoTransacao struct {
	ID     string `json:"id"`
	Nome   string `json:"nome"`
	Efeito string `json:"efeito"`
	Base   bool   `json:"base"`
}

type CategoriaCadastro struct {
	ID   string `json:"id"`
	Nome string `json:"nome"`
	Cor  string `json:"cor"`
	Tipo string `json:"tipo"` // receita | despesa | transferencia
	Base bool   `json:"base"`
	Pai  string `json:"pai,omitempty"`
}

// Breakdown é o gasto consolidado por categoria no período (valores em reais).
type Breakdown struct {
	Nome  string  `json:"nome"`
	Valor float64 `json:"valor"`
}

// Overview é o payload completo da página de Categorias.
type Overview struct {
	Breakdown []Breakdown         `json:"breakdown"`
	Cadastro  []CategoriaCadastro `json:"cadastro"`
	Tipos     []TipoTransacao     `json:"tipos"`
}
