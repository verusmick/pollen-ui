'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/features/i18n/routing';

export function NotificationMessagesHeader() {
  const t = useTranslations('messageSystemPage.notificationMessages.list');

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </div>

      <Link
        href="/rules-and-notifications/notification-messages/new"
        className="inline-flex shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
      >
        {t('newButton')}
      </Link>
    </div>
  );
}
