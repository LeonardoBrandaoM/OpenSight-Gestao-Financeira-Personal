package repository

import (
	"context"
	"math"
	"math/rand"

	"opensight/services/analytics-service/internal/domain"
)

// Janela de 13 meses (YYYY-MM) — espelha shared/lib/mock-helpers.meses no front.
var meses = []string{
	"2025-03", "2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09",
	"2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03",
}

var heatCategorias = []string{
	"Inv. RF", "Investimento", "Compras", "Educação", "Utilidades",
	"Saúde", "Alimentação", "Lazer", "Transporte", "Streaming",
}

var seriesMediaMensal = []string{"Compras", "Educação", "Utilidades", "Saúde", "Lazer", "Entretenimento"}

// CategoryInsights devolve os datasets dos gráficos avançados. Hoje computados a
// partir de seeds determinísticas; o precompute real (a partir de transactions,
// gravando em analytics_db) usa exatamente este formato de read-model.
func (m *MemoryRepo) CategoryInsights(_ context.Context, _ string) (domain.CategoryInsights, error) {
	return domain.CategoryInsights{
		Treemap: []domain.Treemap{
			{Nome: "Investimento RF", Valor: 20514}, {Nome: "Investimento", Valor: 15432},
			{Nome: "Compras", Valor: 6156}, {Nome: "Educação", Valor: 4250},
			{Nome: "Utilidades", Valor: 3871}, {Nome: "Saúde", Valor: 2227},
			{Nome: "Alimentação", Valor: 2153}, {Nome: "Lazer", Valor: 2027},
			{Nome: "Transporte", Valor: 1161},
		},
		HierarquiaInterna: []domain.Hierarquia{
			{Nome: "Crédito", Valor: 82}, {Nome: "Débito", Valor: 18},
		},
		HierarquiaExterna: []domain.HierarquiaExt{
			{Nome: "Salário", Grupo: "Crédito", Valor: 61},
			{Nome: "Investimento", Grupo: "Crédito", Valor: 14},
			{Nome: "Transferência", Grupo: "Crédito", Valor: 7},
			{Nome: "Compras", Grupo: "Débito", Valor: 8},
			{Nome: "Margem", Grupo: "Débito", Valor: 5},
			{Nome: "Inv. RF", Grupo: "Débito", Valor: 5},
		},
		HeatCategorias: heatCategorias,
		Heatmap:        heatmap(),
		Bolhas: []domain.Bolha{
			{Categoria: "Inv. RF", Transacoes: 28, Volume: 20500, Ticket: 732},
			{Categoria: "Investimento", Transacoes: 27, Volume: 15400, Ticket: 571},
			{Categoria: "Compras", Transacoes: 18, Volume: 6156, Ticket: 342},
			{Categoria: "Alimentação", Transacoes: 25, Volume: 4600, Ticket: 184},
			{Categoria: "Utilidades", Transacoes: 23, Volume: 3870, Ticket: 168},
			{Categoria: "Saúde", Transacoes: 23, Volume: 2227, Ticket: 97},
			{Categoria: "Lazer", Transacoes: 26, Volume: 1400, Ticket: 54},
			{Categoria: "Streaming", Transacoes: 28, Volume: 1800, Ticket: 64},
		},
		Radar: []domain.RadarDia{
			{Dia: "Seg", Valor: 520}, {Dia: "Ter", Valor: 340}, {Dia: "Qua", Valor: 610},
			{Dia: "Qui", Valor: 430}, {Dia: "Sex", Valor: 380}, {Dia: "Sáb", Valor: 290},
			{Dia: "Dom", Valor: 560},
		},
		SeriesMediaMensal: seriesMediaMensal,
		MediaMensal:       mediaMensal(),
		Boxplot: []domain.BoxCat{
			{Categoria: "Alimentação", Min: 8, Q1: 32, Mediana: 48, Q3: 64, Max: 120, Outliers: []float64{300, 660}},
			{Categoria: "Compras", Min: 50, Q1: 180, Mediana: 270, Q3: 480, Max: 920, Outliers: []float64{}},
			{Categoria: "Utilidades", Min: 60, Q1: 120, Mediana: 160, Q3: 210, Max: 280, Outliers: []float64{440}},
			{Categoria: "Streaming", Min: 20, Q1: 40, Mediana: 55, Q3: 70, Max: 95, Outliers: []float64{}},
			{Categoria: "Entretenimento", Min: 18, Q1: 45, Mediana: 70, Q3: 110, Max: 160, Outliers: []float64{}},
			{Categoria: "Saúde", Min: 15, Q1: 50, Mediana: 75, Q3: 130, Max: 200, Outliers: []float64{540}},
			{Categoria: "Educação", Min: 40, Q1: 110, Mediana: 160, Q3: 240, Max: 360, Outliers: []float64{}},
			{Categoria: "Transporte", Min: 10, Q1: 28, Mediana: 45, Q3: 70, Max: 110, Outliers: []float64{}},
		},
	}, nil
}

// Anomalies devolve o scatter de detecção (|z| > 2 ≈ valor > 5500).
func (m *MemoryRepo) Anomalies(_ context.Context, _ string) ([]domain.Anomalia, error) {
	r := rand.New(rand.NewSource(101))
	out := make([]domain.Anomalia, 0, 150)
	for i := 0; i < 150; i++ {
		x := r.Float64() * 13
		grande := r.Float64() < 0.14
		var valor float64
		if grande {
			valor = math.Round(4000 + r.Float64()*8000)
		} else {
			valor = math.Round(r.Float64() * 2200)
		}
		tipo := "DEBIT"
		if r.Float64() < 0.3 {
			tipo = "CREDIT"
		}
		out = append(out, domain.Anomalia{X: x, Valor: valor, Tipo: tipo, Anomalia: valor > 5500})
	}
	return out, nil
}

func heatmap() [][]int {
	r := rand.New(rand.NewSource(7))
	m := make([][]int, len(heatCategorias))
	for row := range heatCategorias {
		m[row] = make([]int, len(meses))
		for c := range meses {
			burst := 0.0
			if r.Float64() < 0.12 {
				burst = 1
			}
			m[row][c] = int(math.Round((r.Float64()*0.5 + burst*(0.5+r.Float64()*0.5) + float64(row)*0.02) * 9000))
		}
	}
	return m
}

func mediaMensal() []domain.LinhaMensal {
	r := rand.New(rand.NewSource(19))
	out := make([]domain.LinhaMensal, 0, len(meses))
	for _, mes := range meses {
		ponto := domain.LinhaMensal{"mes": mes}
		for _, s := range seriesMediaMensal {
			ponto[s] = math.Round(r.Float64()*480 + 20)
		}
		out = append(out, ponto)
	}
	return out
}
