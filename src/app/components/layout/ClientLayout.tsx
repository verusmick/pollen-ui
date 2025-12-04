import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 relative bg-gray-100 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
