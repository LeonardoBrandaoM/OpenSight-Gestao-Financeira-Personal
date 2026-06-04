// Primitivos compartilhados pelos módulos de gráficos: wrapper responsivo,
// tooltips escuros, formatador de mês e rampa de cor de heatmap.
import type { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';
import { brl } from '@/shared/theme/tokens';

// Wrapper padrão de ResponsiveContainer usado pelos gráficos do recharts.
export function ResponsiveWrap({ children, height = 260 }: { children: ReactElement; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  );
}

// 2025-07 -> 07/25
export const fmtMes = (m: string) => m.slice(5) + '/' + m.slice(2, 4);

// Tooltip escuro compacto (usado pela maioria dos gráficos avançados).
export function MiniTooltip({ active, payload, label, unidade = 'brl' }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-graphite bg-obsidian/95 px-3 py-2 shadow-tremor-dropdown">
      {label != null && <div className="label-stencil mb-1 text-[0.6rem]">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color || p.fill || p.stroke }} />
          <span className="text-ash">{p.name}</span>
          <span className="value ml-auto text-bone">
            {unidade === 'brl' ? brl(Math.abs(p.value)) : `${p.value}`}
          </span>
        </div>
      ))}
    </div>
  );
}

// Tooltip escuro dos gráficos básicos / por conta (rótulo destacado).
export function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-graphite bg-obsidian/95 px-3 py-2 shadow-tremor-dropdown">
      {label != null && <div className="label-stencil mb-1 text-[0.65rem]">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-ash">{p.name}</span>
          <span className="value ml-auto text-bone">{brl(Math.abs(p.value))}</span>
        </div>
      ))}
    </div>
  );
}

// Rampa de cor void/aço -> ember (para heatmaps).
export function rampEmber(t: number) {
  const a = [22, 25, 31];
  const b = [240, 58, 36];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, t))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
