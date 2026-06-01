import { NavLink } from 'react-router-dom';
import { navItems } from '../nav';

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-graphite bg-obsidian/80">
      {/* Marca */}
      <div className="flex items-center gap-3 border-b border-graphite px-5 py-4">
        <img src="/brand/simbolo-harpia.svg" alt="OpenSight" className="h-9 w-9" />
        <div className="font-display text-lg font-bold tracking-wide text-bone">
          OPEN<span className="text-crimson">SIGHT</span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4">
        <div className="label-stencil mb-2 px-2 text-[0.6rem]">Painel</div>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'border-l-2 border-ember bg-crimson/10 text-bone'
                      : 'border-l-2 border-transparent text-ash hover:bg-graphite/40 hover:text-bone',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={[
                        'inline-block h-1.5 w-1.5 rounded-full',
                        isActive ? 'bg-ember reactor-dot' : 'bg-steel group-hover:bg-ash',
                      ].join(' ')}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Rodapé — selo READ-ONLY */}
      <div className="border-t border-graphite px-5 py-4">
        <div className="flex items-center gap-2 rounded-md border border-brass/40 bg-brass/5 px-3 py-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brass" />
          <span className="label-stencil text-[0.6rem] !text-brass">Somente leitura</span>
        </div>
        <p className="mt-2 text-[0.65rem] leading-snug text-steel">Vigia. Prevê. Protege.</p>
      </div>
    </aside>
  );
}
