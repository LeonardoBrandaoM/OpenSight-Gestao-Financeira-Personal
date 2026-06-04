// OpenSight — tokens de cor para uso em JS/gráficos (Recharts).
// Espelha ../../../Branding/PaletaDeCores.md — mantenha em sincronia.

export const palette = {
  void: '#0A0B0D',
  obsidian: '#121419',
  gunmetal: '#1C1F26',
  graphite: '#2C3038',
  steel: '#4B515C',
  ash: '#8C929C',
  bone: '#E8E4DB',

  crimson: '#C1121F',
  crimsonDeep: '#8A0B16',
  ember: '#F03A24',
  emberGlow: '#FF4D3D',

  brass: '#C8962C',
  brassBright: '#E8B23E',

  gain: '#2FA572',
  gainSoft: '#1E5C44',
  loss: '#E5484D',
  lossSoft: '#5C1F24',
  warning: '#E8A317',
  info: '#5A92B0',
} as const;

// Sequência categórica para dataviz (gastos por categoria, séries).
export const chartColors = [
  palette.crimson,
  palette.brass,
  palette.info,
  palette.gain,
  '#9B6BC9', // ametista fria
  palette.warning,
  '#6B7280', // aço neutro
  '#D9737B', // carmesim claro
];

// Estilo base compartilhado para eixos/grid do Recharts.
export const axisStyle = {
  tick: { fill: palette.ash, fontSize: 11, fontFamily: '"IBM Plex Mono", monospace' },
  axisLine: { stroke: palette.graphite },
  tickLine: { stroke: palette.graphite },
};
export const gridStroke = palette.graphite;

// ===== Formatadores BR =====
export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const brlCompact = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 });

export const pct = (v: number) =>
  `${v > 0 ? '+' : ''}${v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

// Eixo "redondo": dado o valor máximo, devolve um topo arredondado e as marcas
// (segments+1 marcas igualmente espaçadas com passo redondo — 1/2/2.5/5 ×10ⁿ).
// Ex.: max 40k -> [0,10k,20k,30k,40k]; max 80k -> [0,20k,40k,60k,80k]. Ajuste dinâmico.
export function niceAxis(max: number, segments = 4) {
  if (!isFinite(max) || max <= 0) {
    return { domainMax: segments, ticks: Array.from({ length: segments + 1 }, (_, i) => i) };
  }
  const rawStep = max / segments;
  const pow = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const n = rawStep / pow;
  const f = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  const step = f * pow;
  const domainMax = step * segments;
  const ticks = Array.from({ length: segments + 1 }, (_, i) => i * step);
  return { domainMax, ticks };
}
