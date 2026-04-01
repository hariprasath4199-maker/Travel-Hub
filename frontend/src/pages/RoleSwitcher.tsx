import { User, Shield, CheckCircle, Mail, Loader2 } from 'lucide-react';
import { useUserRole } from '@/src/context/UserRoleContext';
import { ROLE_LABELS, type UserRole } from '@/src/visaApi';

const ROLE_COLORS: Record<UserRole, string> = {
  MANAGER: 'bg-blue-100 text-blue-800',
  HR_ADMIN: 'bg-purple-100 text-purple-800',
  COST_CENTRE_OWNER: 'bg-amber-100 text-amber-800',
  VENDOR: 'bg-orange-100 text-orange-800',
  APPLICANT: 'bg-cyan-100 text-cyan-800',
  EVP: 'bg-emerald-100 text-emerald-800',
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  MANAGER: 'Submits visa requests on behalf of employees and monitors progress.',
  HR_ADMIN: 'Manages the full workflow: cost proposals, vendor coordination, and approvals.',
  COST_CENTRE_OWNER: 'Reviews and approves or rejects cost proposals for visa requests.',
  VENDOR: 'Provides available appointment dates and confirms bookings.',
  APPLICANT: 'Selects preferred appointment dates from vendor availability.',
  EVP: 'Provides final executive approval for visa requests.',
};

export default function RoleSwitcher() {
  const { currentUser, allUsers, switchRole, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-10 max-w-[1000px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Role Switcher</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Switch between user roles to test different workflow perspectives.
        </p>
      </div>

      {/* Current Role Banner */}
      {currentUser && (
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <User size={28} />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Current Role</p>
            <p className="text-xl font-bold text-on-surface">{currentUser.name}</p>
            <p className="text-sm text-on-surface-variant">{currentUser.email}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${ROLE_COLORS[currentUser.role]}`}>
            {ROLE_LABELS[currentUser.role]}
          </span>
        </div>
      )}

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allUsers.map((user) => {
          const isActive = currentUser?.role === user.role;
          return (
            <button
              key={user.id}
              onClick={() => switchRole(user.role)}
              className={`text-left p-6 rounded-2xl transition-all ${
                isActive
                  ? 'bg-primary/10 ring-2 ring-primary shadow-md'
                  : 'bg-surface-container-lowest shadow-sm hover:shadow-md hover:bg-surface-container-low/50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6750A4&color=fff&size=48`;
                        }}
                      />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{user.name}</p>
                    <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                      <Mail size={12} />
                      {user.email}
                    </div>
                  </div>
                </div>
                {isActive && (
                  <CheckCircle size={20} className="text-primary" />
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Shield size={14} className="text-on-surface-variant" />
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ROLE_COLORS[user.role]}`}>
                  {ROLE_LABELS[user.role]}
                </span>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                {ROLE_DESCRIPTIONS[user.role]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-surface-container-low rounded-2xl p-6 text-center">
        <p className="text-xs text-on-surface-variant">
          Role switching is for demonstration purposes. Your selected role persists across page reloads via local storage.
        </p>
      </div>
    </div>
  );
}
