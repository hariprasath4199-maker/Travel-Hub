import { useState, useEffect } from 'react';
import { type AppUser, type UserRole, fetchUsers } from '@/src/visaApi';
import { Lock, Mail, Eye, EyeOff, Loader2, ChevronDown } from 'lucide-react';

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: '#dc2626',
  EMPLOYEE: '#0ea5e9',
  MANAGER: '#7c3aed',
  HRBP: '#059669',
  EXECUTIVE: '#6366f1',
  FINANCE: '#d97706',
  VENDOR: '#ec4899',
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  HRBP: 'HR Business Partner',
  EXECUTIVE: 'Executive / EVP',
  FINANCE: 'Finance',
  VENDOR: 'Vendor Partner',
};

// Hardcoded users for GitHub Pages (no backend needed) — remove later
const HARDCODED_USERS: AppUser[] = [
  { id: 'USR-001', name: 'Hariprasath Ramakrishnan', email: 'Hariprasath@zalaris.com', role: 'ADMIN', avatar: 'https://ui-avatars.com/api/?name=Hariprasath+Ramakrishnan&background=dc2626&color=fff&size=128' },
  { id: 'USR-002', name: 'Ravi Shankar', email: 'ravi@zalaris.com', role: 'EMPLOYEE', avatar: 'https://ui-avatars.com/api/?name=Ravi+Shankar&background=0ea5e9&color=fff&size=128' },
  { id: 'USR-003', name: 'Anna Fischer', email: 'anna.fischer@zalaris.com', role: 'MANAGER', avatar: 'https://ui-avatars.com/api/?name=Anna+Fischer&background=7c3aed&color=fff&size=128' },
  { id: 'USR-004', name: 'Hari Kumar', email: 'hari@zalaris.com', role: 'HRBP', avatar: 'https://ui-avatars.com/api/?name=Hari+Kumar&background=059669&color=fff&size=128' },
  { id: 'USR-005', name: 'Marcus Weber', email: 'marcus.weber@zalaris.com', role: 'EXECUTIVE', avatar: 'https://ui-avatars.com/api/?name=Marcus+Weber&background=6366f1&color=fff&size=128' },
  { id: 'USR-006', name: 'Erik Lindqvist', email: 'erik.lindqvist@zalaris.com', role: 'FINANCE', avatar: 'https://ui-avatars.com/api/?name=Erik+Lindqvist&background=d97706&color=fff&size=128' },
  { id: 'USR-007', name: 'VFS Global', email: 'vendor@vfsglobal.com', role: 'VENDOR', avatar: 'https://ui-avatars.com/api/?name=VFS+Global&background=ec4899&color=fff&size=128' },
];

interface LoginProps {
  onLogin: (user: AppUser) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [users, setUsers] = useState<AppUser[]>(HARDCODED_USERS);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [lampOn, setLampOn] = useState(false);

  // Try to fetch from API, fall back to hardcoded
  useEffect(() => {
    fetchUsers().then(u => {
      if (u && u.length > 0) setUsers(u);
    }).catch(() => {});
  }, []);

  function selectUser(user: AppUser) {
    setSelectedUser(user);
    setEmail(user.email);
    setPassword('');
    setShowDropdown(false);
    setError('');
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) { setError('Please select a user'); return; }
    if (!email) { setError('Email is required'); return; }
    setLoggingIn(true);
    setError('');
    setTimeout(() => onLogin(selectedUser), 600);
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center"
      style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0f1019 40%, #111827 100%)' }}>

      {/* Starfield */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(255,255,255,${0.15 + Math.random() * 0.25})`,
              animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Light cone (visible only when lamp is ON) */}
      <div className="absolute z-0 pointer-events-none transition-all duration-1000" style={{
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: `${lampOn ? 320 : 0}px solid transparent`,
        borderRight: `${lampOn ? 320 : 0}px solid transparent`,
        borderTop: `${lampOn ? 600 : 0}px solid rgba(251,191,36,0.035)`,
        filter: lampOn ? 'blur(40px)' : 'none',
      }} />

      {/* Lamp fixture - always visible */}
      <div className="relative z-10 flex flex-col items-center" style={{ marginTop: '40px' }}>
        {/* Ceiling wire */}
        <div style={{ width: 2, height: 40, background: 'linear-gradient(180deg, transparent, #4b5563)' }} />

        {/* Lamp - clickable */}
        <div className="relative cursor-pointer group" onClick={() => setLampOn(!lampOn)}
          title={lampOn ? 'Turn off' : 'Click to sign in'}>
          {/* Shade */}
          <div className="transition-all duration-500" style={{
            width: 0, height: 0,
            borderLeft: '32px solid transparent',
            borderRight: '32px solid transparent',
            borderTop: `38px solid ${lampOn ? '#fbbf24' : '#374151'}`,
            filter: lampOn ? 'drop-shadow(0 0 18px rgba(251,191,36,0.6))' : 'none',
          }} />
          {/* Bulb glow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 transition-all duration-500" style={{
            width: lampOn ? 14 : 6,
            height: lampOn ? 14 : 6,
            borderRadius: '50%',
            background: lampOn ? '#fde68a' : '#1f2937',
            boxShadow: lampOn
              ? '0 0 25px 10px rgba(253,230,138,0.7), 0 0 80px 30px rgba(251,191,36,0.3)'
              : 'none',
          }} />

          {/* Hover hint when lamp is off */}
          {!lampOn && (
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[11px] text-slate-500 font-medium">Click to sign in</span>
            </div>
          )}
        </div>
      </div>

      {/* Login form - only visible when lamp is ON */}
      <div className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ease-out ${
        lampOn ? 'opacity-100 translate-y-0 mt-10' : 'opacity-0 translate-y-12 mt-10 pointer-events-none'
      }`}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(251,191,36,0.12)',
          borderRadius: 24,
          boxShadow: '0 30px 60px rgba(0,0,0,0.5), 0 0 100px rgba(251,191,36,0.04), inset 0 1px 0 rgba(255,255,255,0.08)',
          padding: '36px 32px',
        }}>
          {/* Brand */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
              style={{
                background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))',
                border: '1px solid rgba(251,191,36,0.15)',
                boxShadow: '0 0 30px rgba(251,191,36,0.1)',
              }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#f9fafb' }}>
              Zalaris Travel Hub
            </h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Sign in to manage visa & travel workflows
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin" style={{ color: '#fbbf24' }} />
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* User select */}
              <div className="relative">
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Select User
                </label>
                <button type="button" onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${showDropdown ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: showDropdown ? '0 0 20px rgba(251,191,36,0.08)' : 'none',
                    color: '#f9fafb',
                  }}>
                  {selectedUser ? (
                    <>
                      <img src={selectedUser.avatar} className="w-8 h-8 rounded-full" alt="" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{selectedUser.name}</div>
                        <div className="text-[11px]" style={{ color: ROLE_COLORS[selectedUser.role] }}>{ROLE_LABELS[selectedUser.role]}</div>
                      </div>
                    </>
                  ) : (
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>Choose a user...</span>
                  )}
                  <ChevronDown size={15} style={{ color: 'rgba(255,255,255,0.3)', transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {showDropdown && (
                  <div className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden"
                    style={{
                      background: 'rgba(15,16,25,0.96)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(251,191,36,0.12)',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                      maxHeight: 260,
                      overflowY: 'auto',
                    }}>
                    {users.map(user => (
                      <button key={user.id} type="button" onClick={() => selectUser(user)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 transition-all hover:bg-white/5"
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: selectedUser?.id === user.id ? 'rgba(251,191,36,0.06)' : 'transparent',
                        }}>
                        <img src={user.avatar} className="w-8 h-8 rounded-full" alt="" />
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-sm font-semibold text-white truncate">{user.name}</div>
                          <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{user.email}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                          style={{ background: `${ROLE_COLORS[user.role]}18`, color: ROLE_COLORS[user.role] }}>
                          {user.role}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#f9fafb' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(251,191,36,0.35)'; e.target.style.boxShadow = '0 0 16px rgba(251,191,36,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter any password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#f9fafb' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(251,191,36,0.35)'; e.target.style.boxShadow = '0 0 16px rgba(251,191,36,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
                    style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-xs font-semibold px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loggingIn || !selectedUser}
                className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-35 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#000',
                  boxShadow: '0 4px 20px rgba(245,158,11,0.25), 0 0 40px rgba(245,158,11,0.08)',
                }}>
                {loggingIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" /> Signing in...
                  </span>
                ) : 'Sign In'}
              </button>

              <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Demo mode — select any user and click Sign In
              </p>
            </form>
          )}
        </div>

        <div className="text-center mt-5">
          <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.18)' }}>
            Powered by <span style={{ color: 'rgba(251,191,36,0.4)' }}>Zalaris</span>
          </span>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
