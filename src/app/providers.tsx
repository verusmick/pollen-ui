"use client";

import { AuthGate } from "./components/auth";
import { AuthProvider } from "./context/AuthContext";


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}
