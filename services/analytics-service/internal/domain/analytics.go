// Package domain — tipos das agregações do dashboard (analytics-service).
// Valores em reais (a UI consome direto nos gráficos).
package domain

type PontoSaldo struct {
	Mes   string  `json:"mes"`
	Saldo float64 `json:"saldo"`
}

type FluxoMes struct {
	Mes     string  `json:"mes"`
	Receita float64 `json:"receita"`
	Despesa float64 `json:"despesa"` // negativa (saída)
}

type CategoriaValor struct {
	Nome  string  `json:"nome"`
	Valor float64 `json:"valor"`
}

type Resumo struct {
	ReceitasMes float64 `json:"receitasMes"`
	DespesasMes float64 `json:"despesasMes"`
	EconomiaMes float64 `json:"economiaMes"`
}

// Overview reúne as agregações usadas no dashboard.
type Overview struct {
	BalanceSeries []PontoSaldo     `json:"balanceSeries"`
	Cashflow      []FluxoMes       `json:"cashflow"`
	ByCategory    []CategoriaValor `json:"byCategory"`
	Resumo        Resumo           `json:"resumo"`
}
