// Insights estatísticos por categoria + detecção de anomalias (analytics-service).
// São read-models precomputados; a UI consome direto nos gráficos avançados
// (treemap, sunburst, heatmap, bolhas, radar, box plot e scatter de anomalias).
package domain

type Treemap struct {
	Nome  string  `json:"nome"`
	Valor float64 `json:"valor"`
}

type Hierarquia struct {
	Nome  string  `json:"nome"`
	Valor float64 `json:"valor"`
}

type HierarquiaExt struct {
	Nome  string  `json:"nome"`
	Grupo string  `json:"grupo"`
	Valor float64 `json:"valor"`
}

type Bolha struct {
	Categoria  string  `json:"categoria"`
	Transacoes int     `json:"transacoes"`
	Volume     float64 `json:"volume"`
	Ticket     float64 `json:"ticket"`
}

type RadarDia struct {
	Dia   string  `json:"dia"`
	Valor float64 `json:"valor"`
}

type BoxCat struct {
	Categoria string    `json:"categoria"`
	Min       float64   `json:"min"`
	Q1        float64   `json:"q1"`
	Mediana   float64   `json:"mediana"`
	Q3        float64   `json:"q3"`
	Max       float64   `json:"max"`
	Outliers  []float64 `json:"outliers"`
}

// LinhaMensal: ponto da série multi-linha; "mes" (YYYY-MM) + uma chave por série.
type LinhaMensal map[string]any

// Anomalia: ponto do scatter de detecção (z-score). x = índice do mês.
type Anomalia struct {
	X        float64 `json:"x"`
	Valor    float64 `json:"valor"`
	Tipo     string  `json:"tipo"` // DEBIT | CREDIT
	Anomalia bool    `json:"anomalia"`
}

// CategoryInsights reúne os datasets dos gráficos avançados de Categorias.
type CategoryInsights struct {
	Treemap           []Treemap       `json:"treemap"`
	HierarquiaInterna []Hierarquia    `json:"hierarquiaInterna"`
	HierarquiaExterna []HierarquiaExt `json:"hierarquiaExterna"`
	HeatCategorias    []string        `json:"heatCategorias"`
	Heatmap           [][]int         `json:"heatmap"`
	Bolhas            []Bolha         `json:"bolhas"`
	Radar             []RadarDia      `json:"radar"`
	SeriesMediaMensal []string        `json:"seriesMediaMensal"`
	MediaMensal       []LinhaMensal   `json:"mediaMensal"`
	Boxplot           []BoxCat        `json:"boxplot"`
}
