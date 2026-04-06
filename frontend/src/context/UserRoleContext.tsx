import React, { createContext, useContext, useState, useEffect } from 'react';
import { type AppUser, type UserRole, fetchUsers } from '@/src/visaApi';

// Hardcoded users fallback for GitHub Pages — remove later
const FALLBACK_USERS: AppUser[] = [
  { id: 'USR-001', name: 'Hariprasath Ramakrishnan', email: 'Hariprasath@zalaris.com', role: 'ADMIN', avatar: 'https://ui-avatars.com/api/?name=Hariprasath+Ramakrishnan&background=dc2626&color=fff&size=128' },
  { id: 'USR-002', name: 'Ravi Shankar', email: 'ravi@zalaris.com', role: 'EMPLOYEE', avatar: 'https://ui-avatars.com/api/?name=Ravi+Shankar&background=0ea5e9&color=fff&size=128' },
  { id: 'USR-003', name: 'Anna Fischer', email: 'anna.fischer@zalaris.com', role: 'MANAGER', avatar: 'https://ui-avatars.com/api/?name=Anna+Fischer&background=7c3aed&color=fff&size=128' },
  { id: 'USR-004', name: 'Hari Kumar', email: 'hari@zalaris.com', role: 'HRBP', avatar: 'https://ui-avatars.com/api/?name=Hari+Kumar&background=059669&color=fff&size=128' },
  { id: 'USR-005', name: 'Marcus Weber', email: 'marcus.weber@zalaris.com', role: 'EXECUTIVE', avatar: 'https://ui-avatars.com/api/?name=Marcus+Weber&background=6366f1&color=fff&size=128' },
  { id: 'USR-006', name: 'Erik Lindqvist', email: 'erik.lindqvist@zalaris.com', role: 'FINANCE', avatar: 'https://ui-avatars.com/api/?name=Erik+Lindqvist&background=d97706&color=fff&size=128' },
  { id: 'USR-007', name: 'VFS Global', email: 'vendor@vfsglobal.com', role: 'VENDOR', avatar: 'https://ui-avatars.com/api/?name=VFS+Global&background=ec4899&color=fff&size=128' },
];

interface UserRoleContextType {
  currentUser: AppUser | null;
  allUsers: AppUser[];
  switchRole: (role: UserRole) => void;
  login: (user: AppUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const UserRoleContext = createContext<UserRoleContextType>({
  currentUser: null, allUsers: [], switchRole: () => {}, login: () => {}, logout: () => {}, isAuthenticated: false, loading: true,
});

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const [allUsers, setAllUsers] = useState<AppUser[]>(FALLBACK_USERS);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try API first, fall back to hardcoded users
    fetchUsers().then(users => {
      if (users && users.length > 0) setAllUsers(users);
      restoreSession(users && users.length > 0 ? users : FALLBACK_USERS);
    }).catch(() => {
      restoreSession(FALLBACK_USERS);
    });
  }, []);

  function restoreSession(users: AppUser[]) {
    const savedRole = localStorage.getItem('zalaris_role') as UserRole | null;
    const wasLoggedIn = localStorage.getItem('zalaris_logged_in') === 'true';
    if (wasLoggedIn && savedRole) {
      const user = users.find(u => u.role === savedRole);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    }
    setLoading(false);
  }

  const login = (user: AppUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('zalaris_role', user.role);
    localStorage.setItem('zalaris_logged_in', 'true');
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('zalaris_logged_in');
    localStorage.removeItem('zalaris_role');
  };

  const switchRole = (role: UserRole) => {
    const user = allUsers.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('zalaris_role', role);
    }
  };

  return (
    <UserRoleContext.Provider value={{ currentUser, allUsers, switchRole, login, logout, isAuthenticated, loading }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() { return useContext(UserRoleContext); }
