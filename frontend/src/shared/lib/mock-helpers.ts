// Helpers determinísticos compartilhados pelos mocks (PRNG + calendário).
// Quando o backend existir, isto sai junto com os mocks.

// PRNG determinístico (gera nuvens de pontos / heatmaps estáveis entre renders).
export function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Janela de 13 meses usada por séries/heatmaps de analytics e categorias.
export const meses = [
  '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09',
  '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03',
];
