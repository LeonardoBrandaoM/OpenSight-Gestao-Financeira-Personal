// Package domain — investimentos (investments-service). Visão somente leitura
// agregada (Open Finance / account-service); valores em reais, rendimentos em %.
package domain

type Resumo struct {
	Total            float64 `json:"total"`
	RendimentoMes    float64 `json:"rendimentoMes"`    // % no mês
	Rentabilidade12m float64 `json:"rentabilidade12m"` // % em 12 meses
	AporteMes        float64 `json:"aporteMes"`
}

type Alocacao struct {
	Classe string  `json:"classe"`
	Valor  float64 `json:"valor"`
}

type EvolucaoPonto struct {
	Mes   string  `json:"mes"`
	Valor float64 `json:"valor"`
}

type RendimentoClasse struct {
	Classe     string  `json:"classe"`
	Rendimento float64 `json:"rendimento"` // % no mês
}

type Posicao struct {
	Ativo      string  `json:"ativo"`
	Classe     string  `json:"classe"`
	Valor      float64 `json:"valor"`
	Rendimento float64 `json:"rendimento"` // % no mês
}

// Overview é o payload completo da página de Investimentos.
type Overview struct {
	Resumo              Resumo             `json:"resumo"`
	Alocacao            []Alocacao         `json:"alocacao"`
	Evolucao            []EvolucaoPonto    `json:"evolucao"`
	RendimentoPorClasse []RendimentoClasse `json:"rendimentoPorClasse"`
	Posicoes            []Posicao          `json:"posicoes"`
}
