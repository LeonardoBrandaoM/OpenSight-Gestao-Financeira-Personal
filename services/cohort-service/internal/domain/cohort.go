// Package domain — benchmarking de pares / coorte (cohort-service, RF-012).
// Dados agregados e anonimizados — nunca representam um usuário individual.
package domain

type Comparativo struct {
	Metrica     string  `json:"metrica"`
	Voce        float64 `json:"voce"`
	Mediana     float64 `json:"mediana"`
	Unidade     string  `json:"unidade"`
	MaiorMelhor bool    `json:"maiorMelhor"`
}

type Driver struct {
	Tipo  string `json:"tipo"` // sucesso | fracasso
	Texto string `json:"texto"`
}

type Cohort struct {
	FaixaRenda             string        `json:"faixaRenda"`
	Membros                int           `json:"membros"`
	KMinimo                int           `json:"kMinimo"`
	Trajetoria             string        `json:"trajetoria"`
	TaxaCumprimentoVoce    int           `json:"taxaCumprimentoVoce"`
	TaxaCumprimentoMediana int           `json:"taxaCumprimentoMediana"`
	Comparativos           []Comparativo `json:"comparativos"`
	Drivers                []Driver      `json:"drivers"`
	Recomendacoes          []string      `json:"recomendacoes"`
}
