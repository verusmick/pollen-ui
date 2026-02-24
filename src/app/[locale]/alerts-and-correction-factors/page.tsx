'use client';
import { useThemeStore } from '@/store';
import { useEffect } from 'react';
import { AlertsList, FiltersBar, Tabs } from './components';



export default function AlertsAndCorrectionFactorsPage() {
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    setTheme('light');
  }, []);
  return (
    <main>
      <div className="flex flex-col h-full bg-background text-foreground">
        <Tabs />
        <div className="p-4 space-y-4 overflow-hidden">
          <FiltersBar />
          <AlertsList />
        </div>
      </div>
    </main>
  );
}
