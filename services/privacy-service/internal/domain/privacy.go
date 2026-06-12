// Package domain — direitos do titular LGPD (privacy-service): portabilidade
// (exportação) e eliminação (exclusão de conta). Solicitações são processadas
// de forma assíncrona e em cascata pelos demais serviços (SLA 72h).
package domain

import "errors"

// TipoSolicitacao: tipos de pedido de direito do titular.
type TipoSolicitacao string

const (
	Exportacao TipoSolicitacao = "export"
	Exclusao   TipoSolicitacao = "delete"
)

func (t TipoSolicitacao) Valida() error {
	switch t {
	case Exportacao, Exclusao:
		return nil
	default:
		return errors.New("tipo de solicitação inválido")
	}
}

type Solicitacao struct {
	ID       string          `json:"id"`
	Tipo     TipoSolicitacao `json:"tipo"`
	Status   string          `json:"status"` // pendente | processando | concluido
	CriadoEm string          `json:"criadoEm"`
}
