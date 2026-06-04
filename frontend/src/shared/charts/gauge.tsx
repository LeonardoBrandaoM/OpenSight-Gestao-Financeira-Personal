// Gauge (semicírculo, SVG puro) de % de comprometimento de receita.
import { palette } from '@/shared/theme/tokens';
import { comprometimento } from '@/data/mock';

export function GaugeComprometimento() {
  const W = 260;
  const H = 210;
  const cx = 130;
  const cy = 140;
  const r = 96;
  const sw = 16;
  const pct = comprometimento.pct;
  const frac = Math.max(0, Math.min(1, pct / 100));

  // fração 0..1 -> ponto na semicircunferência superior (0 = esquerda, 1 = direita)
  const pt = (f: number, radius: number) => {
    const a = Math.PI * (1 - f);
    return { x: cx + radius * Math.cos(a), y: cy - radius * Math.sin(a) };
  };
  // arco pela metade de cima (varredura 1, y para baixo) de fração a -> b
  const arc = (a: number, b: number, radius: number) => {
    const s = pt(a, radius);
    const e = pt(b, radius);
    const large = b - a > 0.5 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  // zonas em frações: verde 0–50%, âmbar 50–80%, vermelho 80–100%
  const zonas: [number, number, string][] = [
    [0, 0.5, palette.gain],
    [0.5, 0.8, palette.warning],
    [0.8, 1, palette.loss],
  ];
  const ponta = pt(frac, r - 26);
  const corValor = frac < 0.5 ? palette.gain : frac < 0.8 ? palette.warning : palette.loss;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={210}>
      {zonas.map(([a, b, cor], i) => (
        <path key={i} d={arc(a, b, r)} fill="none" stroke={cor} strokeWidth={sw} strokeLinecap="butt" />
      ))}
      {/* ponteiro */}
      <line x1={cx} y1={cy} x2={ponta.x} y2={ponta.y} stroke={palette.bone} strokeWidth={3} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={6} fill={palette.ember} />
      {/* extremos da escala */}
      <text x={cx - r} y={cy + 22} textAnchor="middle" fill={palette.steel} fontSize={11} fontFamily='"IBM Plex Mono", monospace'>0</text>
      <text x={cx + r} y={cy + 22} textAnchor="middle" fill={palette.steel} fontSize={11} fontFamily='"IBM Plex Mono", monospace'>100</text>
      {/* valor */}
      <text x={cx} y={cy + 46} textAnchor="middle" fill={corValor} fontSize={32} fontWeight={700} fontFamily='"IBM Plex Mono", monospace'>{pct.toFixed(1).replace('.', ',')}%</text>
      <text x={cx} y={cy + 64} textAnchor="middle" fill={palette.ash} fontSize={11}>% comprometido</text>
    </svg>
  );
}
