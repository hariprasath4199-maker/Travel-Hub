import { Search, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { useUserRole } from '@/src/context/UserRoleContext';
import { ROLE_LABELS, type UserRole } from '@/src/visaApi';

export function TopBar() {
  const { currentUser, allUsers, switchRole } = useUserRole();

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-white flex justify-between items-center px-8 z-40 border-b border-surface-container">
      <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full w-96">
        <Search size={18} className="text-on-surface-variant" />
        <input
          className="bg-transparent border-none focus:ring-0 text-sm w-full font-sans placeholder:text-on-surface-variant/50"
          placeholder="Search visa requests..."
          type="text"
        />
      </div>

      <div className="flex items-center gap-6">
        {/* Role Switcher */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors">
            {currentUser ? ROLE_LABELS[currentUser.role] : 'Loading...'}
            <ChevronDown size={14} />
          </button>
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-surface-container p-2 min-w-48 hidden group-hover:block z-50">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold px-3 py-1.5">Switch Role</p>
            {allUsers.map(u => (
              <button
                key={u.id}
                onClick={() => switchRole(u.role as UserRole)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors ${currentUser?.role === u.role ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-surface-container-low'}`}
              >
                <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full" />
                <div>
                  <p className="text-sm font-medium leading-none">{u.name}</p>
                  <p className="text-[10px] text-on-surface-variant">{ROLE_LABELS[u.role as UserRole]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-outline-variant/20 pl-6">
          <button className="text-slate-500 hover:text-primary transition-all relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
          </button>
          <button className="text-slate-500 hover:text-primary transition-all"><HelpCircle size={20} /></button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-on-surface leading-none">{currentUser?.name || 'Loading...'}</p>
            <p className="text-[10px] text-on-surface-variant font-medium tracking-wide uppercase mt-1">{currentUser ? ROLE_LABELS[currentUser.role] : ''}</p>
          </div>
          {currentUser?.avatar && <img alt="Profile" className="w-10 h-10 rounded-full border-2 border-surface-container-high object-cover" src={currentUser.avatar} />}
        </div>
      </div>
    </header>
  );
}
