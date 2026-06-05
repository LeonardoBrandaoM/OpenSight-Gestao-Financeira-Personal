// Treemap de distribuição por categoria, com rótulos (nome + valor + %) e
// tooltip no hover.
import { Tooltip, Treemap } from 'recharts';
import { brl, brlCompact, chartColors, palette } from '@/shared/theme/tokens';
import { treemapCategorias } from '@/data/mock';
import { ResponsiveWrap } from './shared';

function TreemapCell(props: any) {
  const { x, y, width, height, index, value, root } = props;
  const fill = chartColors[index % chartColors.length];
  // O recharts espalha os campos originais do dado nas props (nameKey = "nome").
  const nome: string = props.nome ?? (typeof props.name === 'string' ? props.name : '');
  const valor: number = typeof value === 'number' ? value : props.valor;
  const total: number = root?.value ?? 0;
  const podeNome = !!nome && width > 30 && height > 20;
  const podeValor = !!nome && width > 44 && height > 40;
  const podePct = podeValor && height > 56 && total > 0;
  // trunca o nome para caber na largura da célula
  const maxChars = Math.max(3, Math.floor((width - 20) / 7));
  const nomeCurto = nome.length > maxChars ? `${nome.slice(0, maxChars - 1)}…` : nome;
  // Halo escuro atrás do texto claro → legível sobre qualquer cor de bloco.
  const halo = { stroke: palette.void, strokeWidth: 3, strokeOpacity: 0.5, paintOrder: 'stroke' as const };
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.9} stroke={palette.void} strokeWidth={3} rx={4} />
      {podeNome && (
        <text x={x + 10} y={y + 22} fill={palette.bone} fontSize={12.5} fontWeight={600} {...halo}>
          {nomeCurto}
        </text>
      )}
      {podeValor && (
        <text x={x + 10} y={y + 40} fill={palette.bone} fillOpacity={0.92} fontSize={11} fontFamily='"IBM Plex Mono", monospace' {...halo}>
          {brlCompact(valor)}
        </text>
      )}
      {podePct && (
        <text x={x + 10} y={y + 56} fill={palette.bone} fillOpacity={0.6} fontSize={10} fontFamily='"IBM Plex Mono", monospace' {...halo}>
          {((valor / total) * 100).toFixed(0)}%
        </text>
      )}
    </g>
  );
}
const treemapTotal = treemapCategorias.reduce((s, d) => s + d.valor, 0);
function TreemapTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const node = payload[0]?.payload ?? {};
  const nome: string | undefined = node.nome ?? payload[0]?.name;
  const valor: number | undefined = node.valor ?? node.value ?? payload[0]?.value;
  if (nome == null || valor == null) return null;
  const i = treemapCategorias.findIndex((d) => d.nome === nome);
  const fill = chartColors[(i >= 0 ? i : 0) % chartColors.length];
  return (
    <div className="rounded-md border border-graphite bg-obsidian/95 px-3 py-2 shadow-tremor-dropdown">
      <div className="flex items-center gap-2 text-xs">
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: fill }} />
        <span className="text-bone">{nome}</span>
      </div>
      <div className="value mt-1 text-sm text-bone">{brl(valor)}</div>
      <div className="value text-[0.7rem] text-ash">{((valor / treemapTotal) * 100).toFixed(1)}% do total</div>
    </div>
  );
}
export function CategoriaTreemap({ data = treemapCategorias }: { data?: typeof treemapCategorias }) {
  return (
    <ResponsiveWrap>
      <Treemap data={data} dataKey="valor" nameKey="nome" stroke={palette.void} isAnimationActive={false} content={<TreemapCell />}>
        <Tooltip content={<TreemapTooltip />} />
      </Treemap>
    </ResponsiveWrap>
  );
}
