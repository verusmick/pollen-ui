'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bridge } from './index';

export function IntegrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    bridge.start();

    const unsubscribe = bridge.on((event) => {
      if (event.type === 'SET_LOCALE') {
        const pathname = window.location.pathname;
        const segments = pathname.split('/');

        segments[1] = event.locale;

        router.push(segments.join('/'));
      }
    });

    bridge.emit({ type: 'READY' });

    return () => {
      unsubscribe();
      bridge.stop();
    };
  }, [router]);

  return children;
}
