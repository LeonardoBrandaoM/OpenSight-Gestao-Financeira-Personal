// Package domain — consentimentos Open Finance (consent-service).
package domain

type Consentimento struct {
	Instituicao string   `json:"instituicao"`
	Escopos     []string `json:"escopos"`
	Status      string   `json:"status"` // ativo | expirando | revogado
	ExpiraEm    int      `json:"expiraEm"`
	ConcedidoEm string   `json:"concedidoEm"`
}
