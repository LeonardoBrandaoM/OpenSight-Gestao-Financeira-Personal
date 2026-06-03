import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function Layout() {
  // Começa aberta no desktop e recolhida no mobile.
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024,
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <div className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
