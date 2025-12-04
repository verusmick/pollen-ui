import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden h-full">
        {children}
      </main>
    </div>
  );
}
