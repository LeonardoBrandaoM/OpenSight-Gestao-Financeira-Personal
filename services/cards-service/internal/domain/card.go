// Package domain — cartões de crédito (cards-service). Visão somente leitura
// agregada sobre account-service/transaction-service; valores em reais.
package domain

type Resumo struct {
	Instituicao     string  `json:"instituicao"`
	Apelido         string  `json:"apelido"`
	LimiteTotal     float64 `json:"limiteTotal"`
	FaturaAtual     float64 `json:"faturaAtual"`
	Vencimento      string  `json:"vencimento"`
	Fechamento      string  `json:"fechamento"`
	MelhorDiaCompra string  `json:"melhorDiaCompra"`
}

type FaturaPonto struct {
	Mes   string  `json:"mes"`
	Valor float64 `json:"valor"`
}

type CategoriaValor struct {
	Nome  string  `json:"nome"`
	Valor float64 `json:"valor"`
}

type Lancamento struct {
	Data      string  `json:"data"`
	Descricao string  `json:"descricao"`
	Categoria string  `json:"categoria"`
	Valor     float64 `json:"valor"`
}

// Overview é o payload completo da página de Cartões.
type Overview struct {
	Resumo          Resumo           `json:"resumo"`
	FaturaHistorico []FaturaPonto    `json:"faturaHistorico"`
	PorCategoria    []CategoriaValor `json:"porCategoria"`
	Lancamentos     []Lancamento     `json:"lancamentos"`
}
