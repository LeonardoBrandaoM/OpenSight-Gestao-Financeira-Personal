// Package repository — fonte das projeções (seed; cálculo a partir do histórico
// é o próximo passo — RF-008/RN-004).
package repository

import (
	"context"

	"opensight/packages/httpkit"
	"opensight/services/projection-service/internal/domain"
)

type ProjectionRepository interface {
	Scenarios(ctx context.Context, userID string) ([]domain.Cenario, error)
}

type MemoryRepo struct {
	data map[string][]domain.Cenario
}

func NewMemoryRepo() *MemoryRepo {
	return &MemoryRepo{
		data: map[string][]domain.Cenario{
			httpkit.DevUserID: {
				{Mes: "Jun", Otimista: 49600, Realista: 49100, Pessimista: 48400, Ajustado: 49350},
				{Mes: "Jul", Otimista: 51200, Realista: 50100, Pessimista: 48700, Ajustado: 50650},
				{Mes: "Ago", Otimista: 52900, Realista: 51000, Pessimista: 48900, Ajustado: 51950},
				{Mes: "Set", Otimista: 54700, Realista: 52050, Pessimista: 49100, Ajustado: 53350},
				{Mes: "Out", Otimista: 56600, Realista: 53200, Pessimista: 49400, Ajustado: 54900},
				{Mes: "Nov", Otimista: 58600, Realista: 54300, Pessimista: 49600, Ajustado: 56450},
			},
		},
	}
}

func (m *MemoryRepo) Scenarios(_ context.Context, userID string) ([]domain.Cenario, error) {
	return m.data[userID], nil
}
