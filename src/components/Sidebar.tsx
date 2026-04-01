import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  PlaneTakeoff
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
    { icon: Database, label: 'Requests', to: '/requests' },
    { icon: Users, label: 'Travelers', to: '/travelers' },
    { icon: BarChart3, label: 'Reports', to: '/reports' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-100 flex flex-col py-6 px-4 z-50">
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
          <PlaneTakeoff size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-headline">Sovereign Travel</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Enterprise Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 font-headline text-sm font-medium active:scale-95",
              isActive 
                ? "text-primary bg-white shadow-sm font-semibold" 
                : "text-slate-500 hover:bg-slate-200"
            )}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-2">
        <NavLink 
          to="/requests/new"
          className="w-full py-3 px-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary rounded-xl font-headline font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
        >
          <Plus size={18} />
          <span>New Request</span>
        </NavLink>
      </div>
    </aside>
  );
}
