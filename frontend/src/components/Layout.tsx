import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { UserRoleProvider } from '@/src/context/UserRoleContext';

export function Layout() {
  return (
    <UserRoleProvider>
      <div className="min-h-screen bg-surface">
        <Sidebar />
        <div className="ml-64">
          <TopBar />
          <main className="pt-16">
            <Outlet />
          </main>
        </div>
      </div>
    </UserRoleProvider>
  );
}
