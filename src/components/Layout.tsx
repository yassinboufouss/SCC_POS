import React from 'react';
import Sidebar from './Sidebar';
import { useUserRole } from '@/hooks/use-user-role';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isMember } = useUserRole();
  
  // If the user is identified as a member, they should not see the staff layout.
  if (isMember) {
      return (
        <main className="flex-1 overflow-x-hidden min-h-screen bg-background">
          {children}
        </main>
      );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;