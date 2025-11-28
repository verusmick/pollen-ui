'use client';

import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useEffect, useState } from 'react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  const showBackdrop = isMobile && !collapsed;

  return (
    <div className="flex h-screen overflow-hidden relative">
      {showBackdrop && (
        <div
          className="fixed inset-0 z-10 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
      <Sidebar collapsed={collapsed} isMobile={isMobile} />
      <div className="flex-1 flex flex-col relative z-0">
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="flex-1 relative overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
