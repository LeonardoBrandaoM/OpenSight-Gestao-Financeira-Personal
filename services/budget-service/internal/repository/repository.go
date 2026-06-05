// Package repository — fonte do orçamento (memória/seed; Postgres é o próximo passo).
package repository

import (
	"context"

	"opensight/packages/httpkit"
	"opensight/services/budget-service/internal/domain"
)

type BudgetRepository interface {
	Overview(ctx context.Context, userID string) (domain.Overview, error)
}

func ptr(v float64) *float64 { return &v }

type MemoryRepo struct {
	data map[string]domain.Overview
}

func NewMemoryRepo() *MemoryRepo {
	return &MemoryRepo{
		data: map[string]domain.Overview{
			httpkit.DevUserID: {
				Metas: []domain.Meta{
					{Categoria: "Alimentação", Gasto: 1480, Meta: 1600},
					{Categoria: "Transporte", Gasto: 760, Meta: 700},
					{Categoria: "Lazer", Gasto: 640, Meta: 800},
					{Categoria: "Assinaturas", Gasto: 380, Meta: 350},
				},
				Sugestoes: []domain.Sugestao{
					{Categoria: "Alimentação", Media3m: 1540, MetaAtual: ptr(1600), Tendencia: 4.2},
					{Categoria: "Transporte", Media3m: 720, MetaAtual: ptr(700), Tendencia: 8.1},
					{Categoria: "Lazer", Media3m: 590, MetaAtual: ptr(800), Tendencia: -6.5},
					{Categoria: "Assinaturas", Media3m: 372, MetaAtual: ptr(350), Tendencia: 1.2},
					{Categoria: "Moradia", Media3m: 2080, MetaAtual: nil, Tendencia: 0.6},
					{Categoria: "Saúde", Media3m: 455, MetaAtual: nil, Tendencia: -3.4},
					{Categoria: "Compras", Media3m: 600, MetaAtual: nil, Tendencia: 12.7},
				},
				GastoPorCategoria: map[string]float64{
					"Alimentação": 1480, "Transporte": 760, "Lazer": 640, "Assinaturas": 380,
					"Moradia": 2080, "Saúde": 410, "Compras": 600,
				},
				Comprometimento: domain.Comprometimento{
					Pct: 21.5, Comprometido: 59200.30, Receitas: 275307.86, SaldoLiquido: 216107.56, Status: "Saudável",
				},
			},
		},
	}
}

func (m *MemoryRepo) Overview(_ context.Context, userID string) (domain.Overview, error) {
	return m.data[userID], nil
}
