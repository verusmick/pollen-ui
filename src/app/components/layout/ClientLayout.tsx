'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { SidebarContext } from '@/app/context/SidebarContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const sidebarWidth = collapsed ? 0 : 256;

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SidebarContext.Provider value={{ sidebarWidth }}>
      <div className="h-screen w-screen flex overflow-hidden relative">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main
          className="flex-1 h-full overflow-hidden relative"
          style={{ minWidth: 1 }}
        >
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
