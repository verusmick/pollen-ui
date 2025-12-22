'use client';
import { useAuth } from '@/app/context';
import { AuthModal } from '@/app/components/auth';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {!isAuthenticated && <AuthModal />}
      {children}
    </>
  );
}
