package repository

import (
	"context"

	"opensight/packages/httpkit"
	"opensight/services/notification-service/internal/domain"
)

type NotificationRepository interface {
	List(ctx context.Context, userID string) ([]domain.Alerta, error)
}

type MemoryRepo struct {
	data map[string][]domain.Alerta
}

func NewMemoryRepo() *MemoryRepo {
	return &MemoryRepo{
		data: map[string][]domain.Alerta{
			httpkit.DevUserID: {
				{Severidade: "critico", Tipo: "Anomalia", Titulo: "Gasto fora do padrão", Detalhe: "R$ 480,00 em Eletrônicos — 2,3× acima da sua média.", Quando: "há 2 dias"},
				{Severidade: "critico", Tipo: "Orçamento", Titulo: "Transporte estourou a meta", Detalhe: "R$ 760,00 de R$ 700,00 (109%).", Quando: "há 3 dias"},
				{Severidade: "atencao", Tipo: "Orçamento", Titulo: "Alimentação em 93% da meta", Detalhe: "R$ 1.480,00 de R$ 1.600,00.", Quando: "há 1 dia"},
				{Severidade: "atencao", Tipo: "Consentimento", Titulo: "Consentimento expirando", Detalhe: "Banco Inter expira em 21 dias. Renove para manter a visão ativa.", Quando: "há 5 h"},
				{Severidade: "info", Tipo: "Recorrência", Titulo: "Nova assinatura detectada", Detalhe: "Cobrança recorrente de R$ 21,90 (Spotify) identificada.", Quando: "há 1 semana"},
			},
		},
	}
}

func (m *MemoryRepo) List(_ context.Context, userID string) ([]domain.Alerta, error) {
	return m.data[userID], nil
}
