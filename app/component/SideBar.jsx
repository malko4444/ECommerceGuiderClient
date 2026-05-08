'use client';
import Link from '@bradgarropy/next-link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarContext';
import {
  FaRoad, FaMoneyBill, FaSearch, FaChartLine,
  FaLayerGroup, FaListUl, FaChalkboardTeacher,
  FaHome, FaTimes, FaStore
} from 'react-icons/fa';

const menu = [
  { label: 'Home',       path: '/home',              icon: <FaHome /> },
  { label: 'Roadmap',    path: '/roadmap',           icon: <FaRoad /> },
  { label: 'Budget',     path: '/budget',            icon: <FaMoneyBill /> },
  { label: 'Trending',   path: '/trending-products', icon: <FaSearch /> },
  { label: 'Competitor', path: '/competitor',        icon: <FaChartLine /> },
  { label: 'Profit',     path: '/profit',            icon: <FaChartLine /> },
  { label: 'Vendors',    path: '/vendors',           icon: <FaStore /> },
  { label: 'Platform',   path: '/platformAdvice',    icon: <FaLayerGroup /> },
  { label: 'Guide',      path: '/guide',             icon: <FaListUl /> },
  { label: 'Tutorials',  path: '/tutorials',         icon: <FaChalkboardTeacher /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const close = () => setOpen(false);

  return (
    <>
      {/* Backdrop — only visible on mobile when drawer is open */}
      {open && (
        <div
          onClick={close}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen w-72 md:w-64 shrink-0 z-40
          bg-gradient-to-b from-teal-50 via-white to-white
          border-r border-teal-100 shadow-xl md:shadow-sm
          flex flex-col transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between p-5 border-b border-teal-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md shadow-teal-600/30">
              <FaStore className="text-white" />
            </div>
            <div>
              <p className="text-base font-extrabold text-teal-800 leading-tight">ECommerce</p>
              <p className="text-[11px] text-teal-500 font-medium -mt-0.5">Guider</p>
            </div>
          </div>
          <button
            onClick={close}
            className="md:hidden w-9 h-9 rounded-lg hover:bg-teal-100 flex items-center justify-center text-teal-700"
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4 mb-2">
            Main Menu
          </p>
          <div className="space-y-1">
            {menu.map((item) => {
              const active = pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <div
                    onClick={close}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer
                      transition-all duration-150 text-sm
                      ${active
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/30'
                        : 'text-slate-700 hover:bg-teal-100/70 hover:text-teal-700'}
                    `}
                  >
                    <span className={`text-base ${active ? 'text-white' : 'text-teal-600'}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer callout */}
        <div className="p-4 border-t border-teal-100">
          <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-4 text-white shadow-lg shadow-teal-600/30">
            <p className="text-xs font-bold">Need guidance?</p>
            <p className="text-[11px] opacity-90 mt-0.5 leading-snug">
              Your AI mentor is one click away.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}