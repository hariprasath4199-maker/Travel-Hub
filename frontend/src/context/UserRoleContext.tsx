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

const FALLBACK_USERS: AppUser[] = [
  { id: 'u1', name: 'Gopinath Subramani', email: 'gopinath@zalaris.com', role: 'MANAGER' },
  { id: 'u2', name: 'Hari Kumar', email: 'hari.kumar@zalaris.com', role: 'HR_ADMIN' },
  { id: 'u3', name: 'Anna Fischer', email: 'anna.fischer@zalaris.com', role: 'COST_CENTRE_OWNER' },
  { id: 'u4', name: 'VFS Global', email: 'appointments@vfsglobal.com', role: 'VENDOR' },
  { id: 'u5', name: 'Ravi Shankar', email: 'ravi.shankar@zalaris.com', role: 'APPLICANT' },
  { id: 'u6', name: 'Marcus Weber', email: 'marcus.weber@zalaris.com', role: 'EVP' },
];

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers().then(users => {
      const list = users.length > 0 ? users : FALLBACK_USERS;
      setAllUsers(list);
      const savedRole = localStorage.getItem('zalaris_role') as UserRole | null;
      const user = list.find(u => u.role === (savedRole || 'MANAGER')) || list[0] || null;
      setCurrentUser(user);
      setLoading(false);
    }).catch(() => {
      setAllUsers(FALLBACK_USERS);
      const savedRole = localStorage.getItem('zalaris_role') as UserRole | null;
      const user = FALLBACK_USERS.find(u => u.role === (savedRole || 'MANAGER')) || FALLBACK_USERS[0];
      setCurrentUser(user);
      setLoading(false);
    });
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
