import React, { createContext, useContext, useState, useEffect } from 'react';
import { type AppUser, type UserRole, fetchUsers } from '@/src/visaApi';

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
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers().then(users => {
      setAllUsers(users);
      // Only restore session if user was previously logged in
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
    }).catch(() => setLoading(false));
  }, []);

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
