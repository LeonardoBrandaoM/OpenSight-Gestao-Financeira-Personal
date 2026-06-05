import { useEffect, useState } from 'react';
import { cohort as mock } from './data';
import { fetchCohort, type Cohort } from './api';

// Coorte do cohort-service; inicia com mock (sem flash), mantém em falha.
export function useCohort(): { cohort: Cohort } {
  const [data, setData] = useState<Cohort>(mock);
  useEffect(() => {
    const ctrl = new AbortController();
    fetchCohort(ctrl.signal)
      .then(setData)
      .catch(() => {
        /* mantém mock */
      });
    return () => ctrl.abort();
  }, []);
  return { cohort: data };
}
