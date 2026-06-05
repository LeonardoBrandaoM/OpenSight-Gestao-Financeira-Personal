package repository

import (
	"context"

	"opensight/packages/httpkit"
	"opensight/services/cards-service/internal/domain"
)

type CardRepository interface {
	Overview(ctx context.Context, userID string) (domain.Overview, error)
}

type MemoryRepo struct {
	data map[string]domain.Overview
}

func NewMemoryRepo() *MemoryRepo {
	return &MemoryRepo{
		data: map[string]domain.Overview{
			httpkit.DevUserID: {
				Resumo: domain.Resumo{
					Instituicao:     "Nubank",
					Apelido:         "•••• 3041",
					LimiteTotal:     5000.0,
					FaturaAtual:     2480.34,
					Vencimento:      "10/06",
					Fechamento:      "03/06",
					MelhorDiaCompra: "04",
				},
				FaturaHistorico: []domain.FaturaPonto{
					{Mes: "Dez", Valor: 1980},
					{Mes: "Jan", Valor: 2250},
					{Mes: "Fev", Valor: 2120},
					{Mes: "Mar", Valor: 2680},
					{Mes: "Abr", Valor: 2310},
					{Mes: "Mai", Valor: 2480.34},
				},
				PorCategoria: []domain.CategoriaValor{
					{Nome: "Alimentação", Valor: 760.0},
					{Nome: "Compras", Valor: 540.0},
					{Nome: "Transporte", Valor: 410.0},
					{Nome: "Assinaturas", Valor: 380.0},
					{Nome: "Saúde", Valor: 210.0},
					{Nome: "Lazer", Valor: 180.34},
				},
				Lancamentos: []domain.Lancamento{
					{Data: "30/05", Descricao: "Supermercado Pão de Açúcar", Categoria: "Alimentação", Valor: -287.4},
					{Data: "28/05", Descricao: "Posto Shell", Categoria: "Transporte", Valor: -210.0},
					{Data: "26/05", Descricao: "Amazon", Categoria: "Compras", Valor: -349.9},
					{Data: "24/05", Descricao: "Cinema", Categoria: "Lazer", Valor: -64.0},
					{Data: "22/05", Descricao: "Farmácia Drogasil", Categoria: "Saúde", Valor: -96.3},
					{Data: "20/05", Descricao: "Spotify", Categoria: "Assinaturas", Valor: -21.9},
				},
			},
		},
	}
}

func (m *MemoryRepo) Overview(_ context.Context, userID string) (domain.Overview, error) {
	return m.data[userID], nil
}
