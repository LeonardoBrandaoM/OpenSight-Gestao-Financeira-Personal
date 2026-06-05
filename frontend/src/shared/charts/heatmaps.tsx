// Heatmaps em grid CSS: genérico + categoria×mês e dia×hora.
import { diasSemana, heatCategorias, heatmapCatMes, horarioPico, horas, meses } from '@/data/mock';
import { fmtMes, rampEmber } from './shared';

export function HeatmapGrid({
  rows,
  cols,
  matrix,
  colTick = 1,
}: {
  rows: string[];
  cols: string[];
  matrix: number[][];
  colTick?: number;
}) {
  const max = Math.max(1, ...matrix.flat());
  return (
    <div className="overflow-x-auto">
      <div className="grid gap-1" style={{ gridTemplateColumns: `84px repeat(${cols.length}, minmax(10px, 1fr))` }}>
        {rows.map((rowLabel, r) => (
          <div className="contents" key={r}>
            <div className="flex items-center justify-end pr-2 text-[0.7rem] text-ash">{rowLabel}</div>
            {matrix[r].map((v, c) => (
              <div key={c} className="h-6 rounded-[2px]" style={{ background: rampEmber(v / max) }} title={`${rowLabel} · ${cols[c]}: ${v}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-1 grid gap-1" style={{ gridTemplateColumns: `84px repeat(${cols.length}, minmax(10px, 1fr))` }}>
        <div />
        {cols.map((c, i) => (
          <div key={i} className="text-center text-[0.55rem] text-steel">{i % colTick === 0 ? c : ''}</div>
        ))}
      </div>
    </div>
  );
}

export function HeatmapCatMes({
  categorias = heatCategorias,
  matrix = heatmapCatMes,
}: {
  categorias?: string[];
  matrix?: number[][];
}) {
  return <HeatmapGrid rows={categorias} cols={meses.map(fmtMes)} matrix={matrix} />;
}
export function HorarioPicoHeatmap() {
  return <HeatmapGrid rows={diasSemana} cols={horas.map((h) => `${h}h`)} matrix={horarioPico} colTick={3} />;
}
