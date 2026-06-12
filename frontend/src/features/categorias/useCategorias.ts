import { useEffect, useState } from 'react';
import { categorias } from '@/data/mock';
import { categoriasCadastro, tiposTransacao } from './data';
import { fetchCategoriesOverview, type CategoriesOverview } from './api';

const fallback: CategoriesOverview = {
  breakdown: categorias,
  cadastro: categoriasCadastro,
  tipos: tiposTransacao,
};

// Categorias do categorization-service; inicia com mock (sem flash), cai nele em falha.
export function useCategorias(): { data: CategoriesOverview } {
  const [data, setData] = useState<CategoriesOverview>(fallback);
  useEffect(() => {
    const ctrl = new AbortController();
    fetchCategoriesOverview(ctrl.signal)
      .then(setData)
      .catch(() => {
        /* mantém fallback */
      });
    return () => ctrl.abort();
  }, []);
  return { data };
}
