package repository

import (
	"context"

	"opensight/packages/httpkit"
	"opensight/services/investments-service/internal/domain"
)

type InvestmentRepository interface {
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
					Total:            22480.34,
					RendimentoMes:    3.6,
					Rentabilidade12m: 11.8,
					AporteMes:        800.0,
				},
				Alocacao: []domain.Alocacao{
					{Classe: "Renda fixa", Valor: 11200.0},
					{Classe: "Ações", Valor: 6480.34},
					{Classe: "FIIs", Valor: 3200.0},
					{Classe: "Cripto", Valor: 1600.0},
				},
				Evolucao: []domain.EvolucaoPonto{
					{Mes: "Nov", Valor: 18900},
					{Mes: "Dez", Valor: 19600},
					{Mes: "Jan", Valor: 20100},
					{Mes: "Fev", Valor: 20800},
					{Mes: "Mar", Valor: 21200},
					{Mes: "Abr", Valor: 21650},
					{Mes: "Mai", Valor: 22050},
					{Mes: "Jun", Valor: 22480.34},
				},
				RendimentoPorClasse: []domain.RendimentoClasse{
					{Classe: "Cripto", Rendimento: 12.4},
					{Classe: "Ações", Rendimento: 5.2},
					{Classe: "FIIs", Rendimento: 2.1},
					{Classe: "Renda fixa", Rendimento: 0.9},
				},
				Posicoes: []domain.Posicao{
					{Ativo: "Tesouro Selic 2029", Classe: "Renda fixa", Valor: 7000.0, Rendimento: 0.8},
					{Ativo: "CDB Banco X 110% CDI", Classe: "Renda fixa", Valor: 4200.0, Rendimento: 1.0},
					{Ativo: "PETR4", Classe: "Ações", Valor: 2600.0, Rendimento: 6.1},
					{Ativo: "VALE3", Classe: "Ações", Valor: 1980.34, Rendimento: 5.9},
					{Ativo: "ITUB4", Classe: "Ações", Valor: 1900.0, Rendimento: 3.4},
					{Ativo: "HGLG11", Classe: "FIIs", Valor: 3200.0, Rendimento: 2.1},
					{Ativo: "Bitcoin", Classe: "Cripto", Valor: 1600.0, Rendimento: 12.4},
				},
			},
		},
	}
}

func (m *MemoryRepo) Overview(_ context.Context, userID string) (domain.Overview, error) {
	return m.data[userID], nil
}
