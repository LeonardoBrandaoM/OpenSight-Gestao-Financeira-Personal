package repository

import (
	"context"

	"opensight/packages/httpkit"
	"opensight/services/categorization-service/internal/domain"
)

type CategoryRepository interface {
	Overview(ctx context.Context, userID string) (domain.Overview, error)
}

type MemoryRepo struct {
	data map[string]domain.Overview
}

func NewMemoryRepo() *MemoryRepo {
	return &MemoryRepo{
		data: map[string]domain.Overview{
			httpkit.DevUserID: {
				Breakdown: []domain.Breakdown{
					{Nome: "Moradia", Valor: 2100},
					{Nome: "Alimentação", Valor: 1480},
					{Nome: "Transporte", Valor: 760},
					{Nome: "Lazer", Valor: 640},
					{Nome: "Saúde", Valor: 520},
					{Nome: "Assinaturas", Valor: 380},
					{Nome: "Outros", Valor: 600},
				},
				Cadastro: []domain.CategoriaCadastro{
					{ID: "alimentacao", Nome: "Alimentação", Cor: "#C1121F", Tipo: "despesa", Base: true},
					{ID: "transporte", Nome: "Transporte", Cor: "#C8962C", Tipo: "despesa", Base: true},
					{ID: "moradia", Nome: "Moradia", Cor: "#5A92B0", Tipo: "despesa", Base: true},
					{ID: "saude", Nome: "Saúde", Cor: "#2FA572", Tipo: "despesa", Base: true},
					{ID: "educacao", Nome: "Educação", Cor: "#9B6BC9", Tipo: "despesa", Base: true},
					{ID: "lazer", Nome: "Lazer", Cor: "#E8A317", Tipo: "despesa", Base: true},
					{ID: "compras", Nome: "Compras", Cor: "#6B7280", Tipo: "despesa", Base: true},
					{ID: "servicos", Nome: "Serviços", Cor: "#D9737B", Tipo: "despesa", Base: true},
					{ID: "investimentos", Nome: "Investimentos", Cor: "#1E5C44", Tipo: "despesa", Base: true},
					{ID: "receitas", Nome: "Receitas", Cor: "#2FA572", Tipo: "receita", Base: true},
					{ID: "transferencias", Nome: "Transferências", Cor: "#4B515C", Tipo: "transferencia", Base: true},
					{ID: "outros", Nome: "Outros", Cor: "#8C929C", Tipo: "despesa", Base: true},
					{ID: "assinaturas", Nome: "Assinaturas", Cor: "#F03A24", Tipo: "despesa", Base: false, Pai: "Lazer"},
					{ID: "pets", Nome: "Pets", Cor: "#E8B23E", Tipo: "despesa", Base: false},
				},
				Tipos: []domain.TipoTransacao{
					{ID: "debito", Nome: "Débito", Efeito: "sai", Base: true},
					{ID: "credito", Nome: "Crédito", Efeito: "entra", Base: true},
					{ID: "transferencia", Nome: "Transferência", Efeito: "neutro", Base: true},
					{ID: "reembolso", Nome: "Reembolso", Efeito: "entra", Base: false},
					{ID: "invest-recorrente", Nome: "Investimento recorrente", Efeito: "sai", Base: false},
				},
			},
		},
	}
}

func (m *MemoryRepo) Overview(_ context.Context, userID string) (domain.Overview, error) {
	return m.data[userID], nil
}
