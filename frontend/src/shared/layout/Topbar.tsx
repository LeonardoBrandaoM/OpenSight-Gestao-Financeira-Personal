import { useLocation } from 'react-router-dom';
import { navItems } from '@/shared/nav';
import { syncStatus } from '@/data/mock';

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { pathname } = useLocation();
  const current =
    navItems.find((n) => n.path === pathname) ??
    navItems.find((n) => n.path !== '/' && pathname.startsWith(`${n.path}/`)) ??
    navItems[0];

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-graphite bg-void/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Mostrar ou esconder o menu"
          className="rounded-md border border-graphite bg-gunmetal p-2 text-ash transition-colors hover:border-steel hover:text-bone"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div>
          <h1 className="font-display text-xl font-bold tracking-wide text-bone">{current.title}</h1>
          <p className="text-xs text-ash">{current.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-gain reactor-dot" />
          <span className="text-xs text-ash">
            Sincronizado <span className="text-bone">{syncStatus.ultimaSync}</span> · {syncStatus.instituicoes} instituições
          </span>
        </div>

        <div className="hidden items-center gap-2 rounded-md border border-warning/40 bg-warning/5 px-3 py-1.5 md:flex">
          <span className="label-stencil text-[0.6rem] !text-warning">Consentimento</span>
          <span className="value text-xs text-bone">{syncStatus.consentimentoExpiraEm}d</span>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-graphite bg-gunmetal font-display text-sm font-semibold text-bone">
          LM
        </div>
      </div>
    </header>
  );
}
