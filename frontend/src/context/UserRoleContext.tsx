import React, { createContext, useContext, useState, useEffect } from 'react';
import { type AppUser, type UserRole, fetchUsers } from '@/src/visaApi';

interface UserRoleContextType {
  currentUser: AppUser | null;
  allUsers: AppUser[];
  switchRole: (role: UserRole) => void;
  loading: boolean;
}

const UserRoleContext = createContext<UserRoleContextType>({
  currentUser: null, allUsers: [], switchRole: () => {}, loading: true,
});

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers().then(users => {
      setAllUsers(users);
      const savedRole = localStorage.getItem('zalaris_role') as UserRole | null;
      const user = users.find(u => u.role === (savedRole || 'MANAGER')) || users[0] || null;
      setCurrentUser(user);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const switchRole = (role: UserRole) => {
    const user = allUsers.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('zalaris_role', role);
    }
  };

  return (
    <UserRoleContext.Provider value={{ currentUser, allUsers, switchRole, loading }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() { return useContext(UserRoleContext); }
