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
    const pathWithoutLocale = window.location.pathname.replace(/^\\/(en|es|de|fr|ar|nl)(?=\\/|$)/, '') || '/';
    const lightThemeRoutes = [
      '/alerts-and-correction-factors',
      '/rules-and-notifications'
    ];
    const useLightTheme = lightThemeRoutes.some(function(route) {
      return pathWithoutLocale === route || pathWithoutLocale.indexOf(route + '/') === 0;
    });

    if (useLightTheme) {
      document.documentElement.classList.remove('dark');
    } else {
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
