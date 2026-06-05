// Package domain — trilha de auditoria append-only (audit-service). Registros
// são imutáveis (sem update/delete): só inserção e leitura, sem PII no detalhe.
package domain

import "errors"

type Evento struct {
	ID        string `json:"id"`
	Acao      string `json:"acao"`      // ex.: account.read, consent.revoke
	Recurso   string `json:"recurso"`   // ex.: account:123
	Resultado string `json:"resultado"` // sucesso | negado | erro
	Origem    string `json:"origem"`    // serviço que emitiu
	Em        string `json:"em"`        // RFC3339 UTC
}

// NovoEvento valida os campos mínimos de um evento de auditoria.
type NovoEvento struct {
	Acao      string `json:"acao"`
	Recurso   string `json:"recurso"`
	Resultado string `json:"resultado"`
	Origem    string `json:"origem"`
}

func (n NovoEvento) Valida() error {
	if n.Acao == "" {
		return errors.New("acao obrigatória")
	}
	if n.Resultado == "" {
		return errors.New("resultado obrigatório")
	}
	return nil
}
