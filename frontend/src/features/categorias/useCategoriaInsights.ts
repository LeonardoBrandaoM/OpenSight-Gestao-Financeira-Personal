import { useEffect, useState } from 'react';
import {
  treemapCategorias,
  hierarquiaInterna,
  hierarquiaExterna,
  heatCategorias,
  heatmapCatMes,
  bolhasCategorias,
  radarDiaSemana,
  seriesMediaMensal,
  mediaMensalCategorias,
  boxplotCategorias,
} from './data';
import { fetchCategoryInsights, type CategoryInsights } from './api';

const fallback: CategoryInsights = {
  treemap: treemapCategorias,
  hierarquiaInterna,
  hierarquiaExterna,
  heatCategorias,
  heatmap: heatmapCatMes,
  bolhas: bolhasCategorias,
  radar: radarDiaSemana,
  seriesMediaMensal,
  mediaMensal: mediaMensalCategorias,
  boxplot: boxplotCategorias,
};

// Insights de categorias do analytics-service; inicia com mock, cai nele em falha.
export function useCategoriaInsights(): { insights: CategoryInsights } {
  const [insights, setInsights] = useState<CategoryInsights>(fallback);
  useEffect(() => {
    const ctrl = new AbortController();
    fetchCategoryInsights(ctrl.signal)
      .then(setInsights)
      .catch(() => {
        /* mantém fallback */
      });
    return () => ctrl.abort();
  }, []);
  return { insights };
}
