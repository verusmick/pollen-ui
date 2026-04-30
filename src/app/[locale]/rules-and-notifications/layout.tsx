import type { ReactNode } from 'react';

import { MessageSystemTabs } from './components';

export default function RulesAndNotificationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <MessageSystemTabs />
      <div className="flex min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
