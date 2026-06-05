package repository

import (
	"context"

	"opensight/packages/httpkit"
	"opensight/services/cohort-service/internal/domain"
)

type CohortRepository interface {
	Overview(ctx context.Context, userID string) (domain.Cohort, error)
}

type MemoryRepo struct {
	data map[string]domain.Cohort
}

func NewMemoryRepo() *MemoryRepo {
	return &MemoryRepo{
		data: map[string]domain.Cohort{
			httpkit.DevUserID: {
				FaixaRenda:             "5–10 salários mínimos",
				Membros:                1284,
				KMinimo:                30,
				Trajetoria:             "melhorou",
				TaxaCumprimentoVoce:    75,
				TaxaCumprimentoMediana: 61,
				Comparativos: []domain.Comparativo{
					{Metrica: "Taxa de poupança", Voce: 22, Mediana: 17, Unidade: "% da renda", MaiorMelhor: true},
					{Metrica: "Metas cumpridas", Voce: 75, Mediana: 61, Unidade: "%", MaiorMelhor: true},
					{Metrica: "Gasto em Moradia", Voce: 31, Mediana: 34, Unidade: "% da renda", MaiorMelhor: false},
					{Metrica: "Gasto em Lazer", Voce: 8, Mediana: 11, Unidade: "% da renda", MaiorMelhor: false},
					{Metrica: "Gasto em Assinaturas", Voce: 4.1, Mediana: 2.6, Unidade: "% da renda", MaiorMelhor: false},
				},
				Drivers: []domain.Driver{
					{Tipo: "sucesso", Texto: "Pares que melhoraram mantêm Moradia abaixo de 30% da renda."},
					{Tipo: "sucesso", Texto: "Aporte automático em investimentos no início do mês, antes dos gastos."},
					{Tipo: "fracasso", Texto: "Gasto recorrente em Assinaturas acima da mediana derruba a poupança."},
					{Tipo: "fracasso", Texto: "Metas de Lazer raramente revisadas acompanham quem decaiu de faixa."},
				},
				Recomendacoes: []string{
					"Reduza Assinaturas em ~R$ 60/mês para se alinhar à mediana de poupança da sua faixa.",
					"Defina meta de Lazer em ~9% da renda, padrão dos pares que melhoraram.",
					"Agende um aporte automático no início do mês, como 68% dos bem-sucedidos.",
				},
			},
		},
	}
}

func (m *MemoryRepo) Overview(_ context.Context, userID string) (domain.Cohort, error) {
	return m.data[userID], nil
}
