// Package domain — modelo de orçamento (budget-service).
package domain

type Meta struct {
	Categoria string  `json:"categoria"`
	Gasto     float64 `json:"gasto"`
	Meta      float64 `json:"meta"`
}

type Sugestao struct {
	Categoria string   `json:"categoria"`
	Media3m   float64  `json:"media3m"`
	MetaAtual *float64 `json:"metaAtual"` // null = categoria sem orçamento
	Tendencia float64  `json:"tendencia"`
}

type Comprometimento struct {
	Pct          float64 `json:"pct"`
	Comprometido float64 `json:"comprometido"`
	Receitas     float64 `json:"receitas"`
	SaldoLiquido float64 `json:"saldoLiquido"`
	Status       string  `json:"status"`
}

// Overview reúne o que a página de Orçamento precisa.
type Overview struct {
	Metas             []Meta             `json:"metas"`
	Sugestoes         []Sugestao         `json:"sugestoes"`
	GastoPorCategoria map[string]float64 `json:"gastoPorCategoria"`
	Comprometimento   Comprometimento    `json:"comprometimento"`
}
