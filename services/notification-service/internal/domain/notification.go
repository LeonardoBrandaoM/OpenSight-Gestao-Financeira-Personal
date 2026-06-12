// Package domain — alertas/notificações ao usuário (notification-service).
// Origem: anomalias (analytics), estouros de meta (budget) e consentimentos
// expirando (consent); este serviço apenas entrega o feed consolidado.
package domain

type Alerta struct {
	Severidade string `json:"severidade"` // critico | atencao | info
	Tipo       string `json:"tipo"`
	Titulo     string `json:"titulo"`
	Detalhe    string `json:"detalhe"`
	Quando     string `json:"quando"`
}
