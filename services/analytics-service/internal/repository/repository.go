// Package repository — fonte das agregações. Hoje em memória (seed); o pipeline
// de precompute a partir de transações, gravando em analytics_db, é o próximo
// passo (ArquiteturaOpenSight.md §3.7).
package repository

import (
	"context"

	"opensight/services/analytics-service/internal/domain"
)

const DevUserID = "00000000-0000-0000-0000-000000000001"

type AnalyticsRepository interface {
	Overview(ctx context.Context, userID string) (domain.Overview, error)
	CategoryInsights(ctx context.Context, userID string) (domain.CategoryInsights, error)
	Anomalies(ctx context.Context, userID string) ([]domain.Anomalia, error)
}

type MemoryRepo struct {
	data map[string]domain.Overview
}

func NewMemoryRepo() *MemoryRepo {
	return &MemoryRepo{
		data: map[string]domain.Overview{
			DevUserID: {
				BalanceSeries: []domain.PontoSaldo{
					{Mes: "Jul", Saldo: 38120}, {Mes: "Ago", Saldo: 39540}, {Mes: "Set", Saldo: 41210},
					{Mes: "Out", Saldo: 40880}, {Mes: "Nov", Saldo: 43150}, {Mes: "Dez", Saldo: 44980},
					{Mes: "Jan", Saldo: 45600}, {Mes: "Fev", Saldo: 46010}, {Mes: "Mar", Saldo: 47220},
					{Mes: "Abr", Saldo: 46740}, {Mes: "Mai", Saldo: 48230},
				},
				Cashflow: []domain.FluxoMes{
					{Mes: "Dez", Receita: 8800, Despesa: -6200}, {Mes: "Jan", Receita: 9000, Despesa: -7100},
					{Mes: "Fev", Receita: 8600, Despesa: -5900}, {Mes: "Mar", Receita: 9400, Despesa: -6700},
					{Mes: "Abr", Receita: 8900, Despesa: -7300}, {Mes: "Mai", Receita: 9120, Despesa: -6480},
				},
				ByCategory: []domain.CategoriaValor{
					{Nome: "Moradia", Valor: 2100}, {Nome: "Alimentação", Valor: 1480}, {Nome: "Transporte", Valor: 760},
					{Nome: "Lazer", Valor: 640}, {Nome: "Saúde", Valor: 520}, {Nome: "Assinaturas", Valor: 380},
					{Nome: "Outros", Valor: 600},
				},
				Resumo: domain.Resumo{ReceitasMes: 9120, DespesasMes: 6480.34, EconomiaMes: 2639.66},
			},
		},
	}
}

func (m *MemoryRepo) Overview(_ context.Context, userID string) (domain.Overview, error) {
	return m.data[userID], nil
}
