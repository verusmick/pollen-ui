import { Sidebar } from './Sidebar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 relative bg-gray-100 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
