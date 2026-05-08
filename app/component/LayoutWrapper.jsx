'use client';
import { usePathname } from 'next/navigation';
import Sidebar from './SideBar';
import Topbar from './Topbar';
import { SidebarProvider } from './SidebarContext';

// Routes where the dashboard shell (Sidebar + Topbar) should be HIDDEN.
// Use exact paths for landing/auth screens.
const BARE_ROUTES = ['/', '/login', '/signup', '/admin/login', '/admin/signup','/admin'];

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isBareRoute = BARE_ROUTES.includes(pathname);

  // ── Landing / auth pages: render children alone, no shell ──
  if (isBareRoute) {
    return <>{children}</>;
  }

  // ── Dashboard pages: full shell with Sidebar + Topbar ──
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <div className="p-4 sm:p-6 lg:p-8">
            <Topbar />
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}