'use client';
import { useThemeStore } from '@/store';
import { useEffect } from 'react';

export default function AlertsAndCorrectionFactorsPage() {
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    setTheme('light');
  }, []);
  return (
    <main>
      <div className="w-screen h-screen">
        <h2> Alerts and correction Factors Page</h2>
      </div>
    </main>
  );
}
