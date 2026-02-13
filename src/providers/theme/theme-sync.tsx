'use client';

import { useThemeStore } from '@/stores';
import { useEffect } from 'react';


export function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return null;
}
