// Package domain — cenários de projeção (projection-service).
package domain

// Cenario é um ponto da projeção de patrimônio (RF-008). `ajustado` é o realista
// refinado por pares (só quando há consentimento de benchmarking).
type Cenario struct {
	Mes        string  `json:"mes"`
	Otimista   float64 `json:"otimista"`
	Realista   float64 `json:"realista"`
	Pessimista float64 `json:"pessimista"`
	Ajustado   float64 `json:"ajustado"`
}
