import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';

import { ThemeBridge } from '@/runtime';
import { ReactQueryProvider } from '@/providers';
import { IntegrationProvider } from '@/integration/react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function AppRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    const stored = localStorage.getItem('app-theme');
    const theme = stored ? JSON.parse(stored)?.state?.theme : null;

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  } catch (_) {}
})();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <IntegrationProvider>
            <ThemeBridge />
            {children}
          </IntegrationProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
