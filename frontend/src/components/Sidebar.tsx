import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Database, Users, BarChart3, Settings, PlaneTakeoff, FileCheck, Plane, X, ShieldCheck
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useUserRole } from '@/src/context/UserRoleContext';
import { canAccessNav, type NavItem } from '@/src/utils/roleFilter';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { currentUser } = useUserRole();
  const role = currentUser?.role;

  const allNavItems: { icon: any; label: string; to: string; navKey: NavItem }[] = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/', navKey: 'dashboard' },
    { icon: FileCheck, label: 'Visa Workflow', to: '/visa-requests', navKey: 'visa-requests' },
    { icon: Plane, label: 'Ticket Booking', to: '/ticket-bookings', navKey: 'ticket-bookings' },
    { icon: Database, label: 'Requests', to: '/requests', navKey: 'requests' },
    { icon: Users, label: 'Travelers', to: '/travelers', navKey: 'travelers' },
    { icon: BarChart3, label: 'Reports', to: '/reports', navKey: 'reports' },
    { icon: ShieldCheck, label: 'Admin', to: '/admin', navKey: 'admin' },
    { icon: Settings, label: 'Settings', to: '/settings', navKey: 'settings' },
  ];

  const navItems = role
    ? allNavItems.filter(item => canAccessNav(role, item.navKey))
    : allNavItems.filter(item => item.navKey !== 'admin');

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "h-screen w-64 fixed left-0 top-0 bg-slate-100 flex flex-col py-6 px-4 z-50 transition-transform duration-200",
        open ? "sidebar-mobile-visible" : "sidebar-mobile-hidden"
      )}>
        <div className="mb-10 px-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <PlaneTakeoff size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-headline">Zalaris Travel</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Hub</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-slate-200 text-slate-500">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 font-headline text-sm font-medium active:scale-95",
                isActive
                  ? "text-primary bg-white shadow-sm font-semibold"
                  : "text-slate-500 hover:bg-slate-200",
                item.navKey === 'admin' && "text-red-600 hover:text-red-700",
                item.navKey === 'admin' && isActive && "text-red-700 bg-red-50",
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto" />
      </aside>
    </>
  );
}
