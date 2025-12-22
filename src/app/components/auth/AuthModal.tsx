'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context';

export function AuthModal() {
  const { login } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const success = login(user, pass);

    if (!success) {
      setError('Invalid username or password');
      setTimeout(() => {
        router.replace('/unauthorized');
      }, 800);
    }else{
      router.replace('/forecast');
    }
  };

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border border-border bg-panel p-6 shadow-2xl">
        <h2 className="mb-1 text-lg font-semibold text-textPrimary">
          Authentication required
        </h2>
        <p className="mb-5 text-sm text-textSecondary">
          Please enter your credentials to continue
        </p>

        <div className="space-y-4">
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Username"
            className="
              w-full rounded-md border border-border bg-surface px-3 py-2
              text-sm text-textPrimary placeholder-textSecondary
              focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent
            "
          />

          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Password"
            className="
              w-full rounded-md border border-border bg-surface px-3 py-2
              text-sm text-textPrimary placeholder-textSecondary
              focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent
            "
          />

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            className="
              w-full rounded-md bg-accent px-4 py-2 text-sm font-medium
              text-white transition
              hover:bg-accentHover
              focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1
              focus:ring-offset-panel
            "
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}
