// Fluxo financeiro (sankey): tipo → categoria → estabelecimento. Cada categoria
// tem sua cor e o estabelecimento herda a cor da categoria de origem.
import { Sankey, Tooltip } from 'recharts';
import { chartColors, palette } from '../theme/tokens';
import { sankeyData } from '../data/mock';
import { MiniTooltip, ResponsiveWrap } from './shared';

const fluxoCategorias = ['Educação', 'Compras', 'Utilidades', 'Saúde', 'Entretenimento', 'Alimentação'];
const corPorCategoria: Record<string, string> = Object.fromEntries(
  fluxoCategorias.map((nome, i) => [nome, chartColors[i % chartColors.length]]),
);
// nome do nó -> cor (Débitos = crimson; categoria = sua cor; estabelecimento = cor do pai)
const corPorNo: Record<string, string> = (() => {
  const map: Record<string, string> = { Débitos: palette.crimson, ...corPorCategoria };
  for (const l of sankeyData.links) {
    const src = sankeyData.nodes[l.source].name;
    const tgt = sankeyData.nodes[l.target].name;
    if (corPorCategoria[src]) map[tgt] = corPorCategoria[src];
  }
  return map;
})();
// cor da categoria associada a um link (source é a categoria, ou — vindo de "Débitos" — é o target)
function corDoLink(index: number): string {
  const l = sankeyData.links[index];
  const src = sankeyData.nodes[l.source].name;
  const tgt = sankeyData.nodes[l.target].name;
  return corPorCategoria[src] ?? corPorCategoria[tgt] ?? palette.steel;
}

// Layout do Sankey (constantes compartilhadas entre <Sankey> e o nó custom).
const SANKEY_HEIGHT = 400;
const SANKEY_MARGIN = { top: 8, right: 90, bottom: 8, left: 70 };
const SANKEY_NODE_PADDING = 10;

function SankeyNode({ x, y, width, height, payload }: any) {
  const ehFonte = x < 100;
  const cor = corPorNo[payload.name] ?? palette.crimson;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={cor} fillOpacity={0.9} rx={1} />
      <text x={ehFonte ? x + width + 6 : x - 6} y={y + height / 2} textAnchor={ehFonte ? 'start' : 'end'} dominantBaseline="middle" fill={palette.bone} fontSize={10}>
        {payload.name}
      </text>
    </g>
  );
}
function SankeyLink({ sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth, index }: any) {
  return (
    <path
      d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
      fill="none"
      stroke={corDoLink(index)}
      strokeWidth={Math.max(1, linkWidth)}
      strokeOpacity={0.4}
    />
  );
}
export function FluxoSankey() {
  // iterations={0} preserva a ordem aninhada dos nós (categorias e seus
  // estabelecimentos contíguos), evitando que os links se cruzem.
  return (
    <ResponsiveWrap height={SANKEY_HEIGHT}>
      <Sankey data={sankeyData} nodePadding={SANKEY_NODE_PADDING} nodeWidth={10} linkCurvature={0.5} iterations={0}
        node={<SankeyNode />} link={<SankeyLink />} margin={SANKEY_MARGIN}>
        <Tooltip content={<MiniTooltip />} />
      </Sankey>
    </ResponsiveWrap>
  );
}
